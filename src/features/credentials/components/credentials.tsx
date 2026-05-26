"use client";

import {
  KeyIcon,
  MoreVerticalIcon,
  PencilIcon,
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

import { CREDENTIAL_TYPE_LABELS } from "../lib/credential-types";
import { CreateCredentialDialog } from "./create-credential-dialog";
import { EditCredentialDialog } from "./edit-credential-dialog";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";

type CredentialItem = {
  id: string;
  name: string;
  type: string;
  maskedValue: string;
  updatedAt: string | Date;
};

const CredentialCard = ({ credential }: { credential: CredentialItem }) => {
  const removeCredential = useRemoveCredential();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const typeLabel =
    CREDENTIAL_TYPE_LABELS[
      credential.type as keyof typeof CREDENTIAL_TYPE_LABELS
    ] ?? credential.type;

  const handleDelete = () => {
    removeCredential.mutate(
      { id: credential.id },
      { onSettled: () => setDeleteOpen(false) },
    );
  };

  return (
    <>
      <EntityCard
        href={`/credentials/${credential.id}`}
        title={credential.name}
        subtitle={`${typeLabel} · ${credential.maskedValue}`}
        media={<KeyIcon className="size-5 text-muted-foreground" />}
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.preventDefault();
                  setEditOpen(true);
                }}
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <EditCredentialDialog
        credential={credential}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete credential?</AlertDialogTitle>
            <AlertDialogDescription>
              Workflows using this credential will fail until you select another
              one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeCredential.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={removeCredential.isPending}
            >
              {removeCredential.isPending ? <Spinner /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const CredentialsList = () => {
  const { data: credentials } = useSuspenseCredentials();

  if (credentials.length === 0) {
    return (
      <EntityEmpty
        title="No credentials yet"
        description="Add API keys and webhooks once, then reuse them across workflow nodes."
        icon={<KeyIcon />}
        action={
          <CreateCredentialDialog>
            <Button>
              <PlusIcon />
              New credential
            </Button>
          </CreateCredentialDialog>
        }
      />
    );
  }

  return (
    <EntityGrid>
      {credentials.map((credential) => (
        <CredentialCard key={credential.id} credential={credential} />
      ))}
    </EntityGrid>
  );
};

export const CredentialsView = () => {
  return (
    <EntityContainer className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Credentials
          </h1>
          <p className="text-sm text-muted-foreground">
            Securely store API keys and webhooks for your workflows
          </p>
        </div>
        <CreateCredentialDialog>
          <Button className="shrink-0">
            <PlusIcon />
            New credential
          </Button>
        </CreateCredentialDialog>
      </header>
      <Suspense fallback={<EntityLoading count={6} />}>
        <CredentialsList />
      </Suspense>
    </EntityContainer>
  );
};

export const CredentialsLoading = () => (
  <EntityContainer className="space-y-6">
    <header>
      <h1 className="text-xl font-semibold">Credentials</h1>
    </header>
    <EntityLoading count={6} />
  </EntityContainer>
);
