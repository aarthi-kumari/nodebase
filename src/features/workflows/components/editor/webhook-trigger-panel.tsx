"use client";

import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { useRegenerateWebhookSecret } from "../../hooks/use-workflow";

type WebhookTriggerPanelProps = {
  workflowId: string;
  webhookSecret: string | null;
};

const getAppBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"
  );
};

export const WebhookTriggerPanel = ({
  workflowId,
  webhookSecret,
}: WebhookTriggerPanelProps) => {
  const regenerate = useRegenerateWebhookSecret();

  const webhookUrl = useMemo(
    () => `${getAppBaseUrl()}/api/webhooks/${workflowId}`,
    [workflowId],
  );

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Webhook URL</Label>
        <div className="flex gap-2">
          <Input readOnly value={webhookUrl} className="font-mono text-xs" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => copy(webhookUrl, "Webhook URL")}
          >
            <CopyIcon className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Send a POST request with your JSON body to start this workflow.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Secret</Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={webhookSecret ?? "Generating…"}
            className="font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!webhookSecret}
            onClick={() =>
              webhookSecret ? copy(webhookSecret, "Secret") : undefined
            }
          >
            <CopyIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={regenerate.isPending}
            onClick={() => regenerate.mutate({ id: workflowId })}
            title="Regenerate secret"
          >
            {regenerate.isPending ? (
              <Spinner />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pass as{" "}
          <code className="rounded bg-muted px-1">x-webhook-secret</code> or{" "}
          <code className="rounded bg-muted px-1">
            Authorization: Bearer …
          </code>
          . Empty POST bodies are accepted.
        </p>
        <p className="text-xs text-muted-foreground">
          On PowerShell, prefer{" "}
          <code className="rounded bg-muted px-1">Invoke-RestMethod</code> or
          put JSON in a variable before{" "}
          <code className="rounded bg-muted px-1">curl.exe --data-raw</code>.
        </p>
      </div>
    </>
  );
};
