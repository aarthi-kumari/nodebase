"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { NODE_DEFINITIONS, type WorkflowNodeData } from "../../lib/node-types";

export const BaseNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const definition = NODE_DEFINITIONS[nodeData.type];
  const Icon = definition.icon;

  return (
    <div
      id="base-node"
      className={`relative min-w-[220px] rounded-lg border-2 bg-card px-4 py-3 shadow-sm transition-shadow ${
        selected
          ? "border-primary shadow-md"
          : "border-border hover:border-muted-foreground/40"
      }`}
    >
      {definition.hasTarget ? (
        <Handle
          type="target"
          position={Position.Top}
          className="!size-3 !border-2 !border-background !bg-muted-foreground"
        />
      ) : null}
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{nodeData.label}</p>
          {nodeData.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {nodeData.description}
            </p>
          ) : null}
        </div>
      </div>
      {definition.hasSource ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!size-3 !border-2 !border-background !bg-muted-foreground"
        />
      ) : null}
    </div>
  );
};
