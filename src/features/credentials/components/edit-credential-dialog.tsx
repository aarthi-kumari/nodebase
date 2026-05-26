"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import {
  CREDENTIAL_TYPE_LABELS,
  type CredentialTypeName,
} from "../lib/credential-types";
import { useUpdateCredential } from "../hooks/use-credentials";

type EditCredentialDialogProps = {
  credential: {
    id: string;
    name: string;
    type: string;
    maskedValue: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditCredentialDialog = ({
  credential,
  open,
  onOpenChange,
}: EditCredentialDialogProps) => {
  const updateCredential = useUpdateCredential();
  const [name, setName] = useState(credential.name);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setName(credential.name);
      setValue("");
    }
  }, [open, credential.name]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    updateCredential.mutate(
      {
        id: credential.id,
        name,
        ...(value.trim() ? { value: value.trim() } : {}),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setValue("");
        },
      },
    );
  };

  const typeLabel =
    CREDENTIAL_TYPE_LABELS[credential.type as CredentialTypeName] ??
    credential.type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit credential</DialogTitle>
            <DialogDescription>
              Update the display name or rotate the secret. Type is{" "}
              <span className="font-medium text-foreground">{typeLabel}</span>{" "}
              and cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-credential-name">Name</Label>
              <Input
                id="edit-credential-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credential-value">
                New secret value (optional)
              </Label>
              <Input
                id="edit-credential-value"
                type="password"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={`Leave blank to keep ${credential.maskedValue}`}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCredential.isPending}>
              {updateCredential.isPending ? <Spinner /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
