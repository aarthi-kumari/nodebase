"use client";

import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { nodeUsesCredential } from "@/features/credentials/lib/credential-types";

import { CredentialSelector } from "./credential-selector";
import { WebhookTriggerPanel } from "./webhook-trigger-panel";
import type { WorkflowNode } from "../../lib/graph";
import {
  createNodeData,
  isTriggerNodeType,
  NODE_CATEGORIES,
  NODE_DEFINITIONS,
  NodeType,
  type WorkflowNodeConfig,
  type WorkflowNodeData,
} from "../../lib/node-types";

type NodeConfigPanelProps = {
  workflowId: string;
  webhookSecret: string | null;
  selectedNode: WorkflowNode | null;
  nodes: WorkflowNode[];
  onUpdate: (
    nodeId: string,
    data: WorkflowNodeData,
    options?: { recordHistory?: boolean },
  ) => void;
  onDelete: (nodeId: string) => void;
};

const isAiNode = (type: NodeType) =>
  type === NodeType.OPENAI ||
  type === NodeType.ANTHROPIC ||
  type === NodeType.GEMINI;

const isMessagingNode = (type: NodeType) =>
  type === NodeType.DISCORD || type === NodeType.SLACK;

export const NodeConfigPanel = ({
  workflowId,
  webhookSecret,
  selectedNode,
  nodes,
  onUpdate,
  onDelete,
}: NodeConfigPanelProps) => {
  if (!selectedNode) {
    return (
      <aside className="flex w-72 shrink-0 flex-col border-l bg-background">
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium">No node selected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a node on the canvas to edit its type, name, and settings.
          </p>
        </div>
      </aside>
    );
  }

  const { id, data } = selectedNode;
  const config = data.config ?? {};
  const definition = NODE_DEFINITIONS[data.type];

  const updateData = (patch: Partial<WorkflowNodeData>) => {
    onUpdate(id, { ...data, ...patch }, { recordHistory: false });
  };

  const updateConfig = (patch: Partial<WorkflowNodeConfig>) => {
    onUpdate(
      id,
      {
        ...data,
        config: { ...config, ...patch },
      },
      { recordHistory: false },
    );
  };

  const handleTypeChange = (newType: NodeType) => {
    if (newType === data.type) {
      return;
    }

    if (isTriggerNodeType(newType)) {
      const hasOtherTrigger = nodes.some(
        (node) => node.id !== id && isTriggerNodeType(node.data.type),
      );

      if (hasOtherTrigger) {
        return;
      }
    }

    const defaults = createNodeData(newType);
    onUpdate(
      id,
      {
        ...defaults,
        label: data.label || defaults.label,
        config: {},
      },
      { recordHistory: true },
    );
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l bg-background">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Node settings</h2>
        <p className="text-xs text-muted-foreground">
          Configure the selected node
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-5 p-4">
          <div className="space-y-2">
            <Label htmlFor="node-type">Node type</Label>
            <Select value={data.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="node-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {NODE_CATEGORIES.map((category) => {
                  const options = Object.values(NODE_DEFINITIONS).filter(
                    (node) => node.category === category,
                  );

                  return (
                    <SelectGroup key={category}>
                      <SelectLabel>{category}</SelectLabel>
                      {options.map((option) => (
                        <SelectItem key={option.type} value={option.type}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {definition.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="node-label">Display name</Label>
            <Input
              id="node-label"
              value={data.label}
              onChange={(event) => updateData({ label: event.target.value })}
              placeholder="e.g. Fetch user data"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-description">Description</Label>
            <Textarea
              id="node-description"
              value={data.description ?? ""}
              onChange={(event) =>
                updateData({ description: event.target.value })
              }
              placeholder="What does this step do?"
              rows={2}
            />
          </div>

          {data.type === NodeType.WEBHOOK_TRIGGER ? (
            <>
              <Separator />
              <WebhookTriggerPanel
                workflowId={workflowId}
                webhookSecret={webhookSecret}
              />
            </>
          ) : null}

          {data.type === NodeType.HTTP_REQUEST ? (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="http-method">Method</Label>
                <Select
                  value={config.method ?? "GET"}
                  onValueChange={(value) =>
                    updateConfig({
                      method: value as WorkflowNodeConfig["method"],
                    })
                  }
                >
                  <SelectTrigger id="http-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["GET", "POST", "PUT", "PATCH", "DELETE"] as const).map(
                      (method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="http-url">URL</Label>
                <Input
                  id="http-url"
                  value={config.url ?? ""}
                  onChange={(event) => updateConfig({ url: event.target.value })}
                  placeholder="https://api.example.com/data"
                />
              </div>
            </>
          ) : null}

          {nodeUsesCredential(data.type) ? (
            <>
              <Separator />
              <CredentialSelector
                nodeType={data.type}
                value={config.credentialId}
                onChange={(credentialId) => updateConfig({ credentialId })}
              />
            </>
          ) : null}

          {isAiNode(data.type) ? (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Prompt</Label>
                <Textarea
                  id="ai-prompt"
                  value={config.prompt ?? ""}
                  onChange={(event) =>
                    updateConfig({ prompt: event.target.value })
                  }
                  placeholder="Instructions for the AI model..."
                  rows={4}
                />
              </div>
            </>
          ) : null}

          {isMessagingNode(data.type) ? (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="webhook-url">
                  Webhook URL (optional if using credential)
                </Label>
                <Input
                  id="webhook-url"
                  value={config.webhookUrl ?? ""}
                  onChange={(event) =>
                    updateConfig({ webhookUrl: event.target.value })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
            </>
          ) : null}

          <Separator />

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onDelete(id)}
          >
            <Trash2Icon />
            Delete node
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
};
