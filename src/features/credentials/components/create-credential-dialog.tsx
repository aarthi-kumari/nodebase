"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import {
  CREDENTIAL_TYPE_OPTIONS,
  type CredentialTypeName,
} from "../lib/credential-types";
import { useCreateCredential } from "../hooks/use-credentials";

type CreateCredentialDialogProps = {
  children: React.ReactNode;
};

export const CreateCredentialDialog = ({
  children,
}: CreateCredentialDialogProps) => {
  const createCredential = useCreateCredential();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OPENAI");
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    createCredential.mutate(
      {
        name,
        type: type as CredentialTypeName,
        value,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setValue("");
          setType("OPENAI");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New credential</DialogTitle>
            <DialogDescription>
              Store an API key or webhook URL securely. It is encrypted at rest
              and only used when workflows run.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credential-name">Name</Label>
              <Input
                id="credential-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Production OpenAI"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credential-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="credential-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credential-value">Secret value</Label>
              <Input
                id="credential-value"
                type="password"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="sk-..."
                required
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCredential.isPending}>
              {createCredential.isPending ? <Spinner /> : null}
              Save credential
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
