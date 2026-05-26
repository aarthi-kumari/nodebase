"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";

import {
  CREDENTIAL_TYPE_LABELS,
  nodeTypeToCredentialType,
} from "@/features/credentials/lib/credential-types";
import { NodeType } from "../../lib/node-types";

type CredentialSelectorProps = {
  nodeType: NodeType;
  value?: string;
  onChange: (credentialId: string | undefined) => void;
};

export const CredentialSelector = ({
  nodeType,
  value,
  onChange,
}: CredentialSelectorProps) => {
  const trpc = useTRPC();
  const credentialType = nodeTypeToCredentialType(nodeType);

  const { data: credentials = [] } = useQuery(
    trpc.credentials.getMany.queryOptions(),
  );

  if (!credentialType) {
    return null;
  }

  const filtered = credentials.filter(
    (credential) => credential.type === credentialType,
  );

  return (
    <div className="space-y-2">
      <Label>Credential</Label>
      <Select
        value={value ?? "none"}
        onValueChange={(next) =>
          onChange(next === "none" ? undefined : next)
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select credential" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None (use env variable)</SelectItem>
          {filtered.map((credential) => (
            <SelectItem key={credential.id} value={credential.id}>
              {credential.name} ({credential.maskedValue})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {CREDENTIAL_TYPE_LABELS[credentialType]} keys from{" "}
        <Link href="/credentials" className="underline underline-offset-2">
          Credentials
        </Link>
        . {filtered.length === 0 ? "None saved yet for this type." : null}
      </p>
    </div>
  );
};
