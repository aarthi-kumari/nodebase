"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FolderOpenIcon,
  MoreVerticalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Suspense, useState } from "react";

import {
  EntityCard,
  EntityContainer,
  EntityEmpty,
  EntityGrid,
  EntityLoading,
} from "@/components/entity-components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

import { CreateWorkflowDialog } from "./create-workflow-dialog";
import {
  type WorkflowListItem,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";

const WorkflowCard = ({ workflow }: { workflow: WorkflowListItem }) => {
  const removeWorkflow = useRemoveWorkflow();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    removeWorkflow.mutate(
      { id: workflow.id },
      { onSettled: () => setDeleteOpen(false) },
    );
  };

  return (
    <>
      <EntityCard
        href={`/workflows/${workflow.id}`}
        title={workflow.name}
        subtitle={`Updated ${formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}`}
        media={<FolderOpenIcon className="size-5 text-muted-foreground" />}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(event) => event.preventDefault()}
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{workflow.name}&rdquo;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeWorkflow.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={removeWorkflow.isPending}
            >
              {removeWorkflow.isPending ? <Spinner /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const WorkflowsListContent = () => {
  const { data: workflows } = useSuspenseWorkflows() as {
    data: WorkflowListItem[];
  };

  if (workflows.length === 0) {
    return (
      <EntityEmpty
        title="No workflows yet"
        description="Create your first workflow to start automating tasks."
        icon={<FolderOpenIcon />}
        action={
          <CreateWorkflowDialog>
            <Button>
              <PlusIcon />
              New Workflow
            </Button>
          </CreateWorkflowDialog>
        }
      />
    );
  }

  return (
    <EntityGrid>
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </EntityGrid>
  );
};

export const WorkflowsView = () => {
  return (
    <EntityContainer className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Workflows
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your workflows
          </p>
        </div>
        <CreateWorkflowDialog>
          <Button className="shrink-0">
            <PlusIcon />
            New Workflow
          </Button>
        </CreateWorkflowDialog>
      </header>
      <Suspense fallback={<EntityLoading />}>
        <WorkflowsListContent />
      </Suspense>
    </EntityContainer>
  );
};
