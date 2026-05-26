"use client";

import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon, FolderOpenIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";

import { EntityContainer } from "@/components/entity-components";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { CREDENTIAL_TYPE_LABELS, type CredentialTypeName } from "../lib/credential-types";
import {
  useRemoveCredential,
  useSuspenseCredential,
} from "../hooks/use-credentials";
import { EditCredentialDialog } from "./edit-credential-dialog";

export const CredentialDetail = ({ credentialId }: { credentialId: string }) => {
  const router = useRouter();
  const { data: credential } = useSuspenseCredential(credentialId);
  const removeCredential = useRemoveCredential();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!credential) {
    notFound();
  }

  const typeLabel =
    CREDENTIAL_TYPE_LABELS[credential.type as CredentialTypeName] ??
    credential.type;

  const handleDelete = () => {
    removeCredential.mutate(
      { id: credential.id },
      {
        onSuccess: () => {
          router.push("/credentials");
        },
        onSettled: () => setDeleteOpen(false),
      },
    );
  };

  return (
    <EntityContainer className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit gap-2 px-0" asChild>
          <Link href="/credentials">
            <ArrowLeftIcon className="size-4" />
            Back to credentials
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                {credential.name}
              </h1>
              <Badge variant="secondary">{typeLabel}</Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              {credential.maskedValue}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border bg-card p-5 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Created</p>
          <p className="font-medium">
            {format(new Date(credential.createdAt), "PPp")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Last updated</p>
          <p className="font-medium">
            {formatDistanceToNow(new Date(credential.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Used in workflows</h2>
        {credential.usedInWorkflows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No workflows reference this credential yet.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {credential.usedInWorkflows.map((workflow) => (
              <li key={workflow.id}>
                <Link
                  href={`/workflows/${workflow.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/50"
                >
                  <FolderOpenIcon className="size-4 text-muted-foreground" />
                  <span className="font-medium">{workflow.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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
              {credential.usedInWorkflows.length > 0
                ? `This credential is used in ${credential.usedInWorkflows.length} workflow(s). Those nodes will fail until you pick another credential or env variable.`
                : "This action cannot be undone."}
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
    </EntityContainer>
  );
};
