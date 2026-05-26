import type { WorkflowEdge, WorkflowNode } from "./graph";
import { NodeType, isTriggerNodeType } from "./node-types";

export class WorkflowExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowExecutionError";
  }
}

export const getExecutionOrder = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options?: { triggerType?: NodeType },
): WorkflowNode[] => {
  const triggerType =
    options?.triggerType ??
    nodes.find((node) => isTriggerNodeType(node.data.type))?.data.type;

  if (!triggerType || !isTriggerNodeType(triggerType)) {
    throw new WorkflowExecutionError(
      "Workflow must have a trigger node to run.",
    );
  }

  const trigger = nodes.find((node) => node.data.type === triggerType);

  if (!trigger) {
    throw new WorkflowExecutionError(
      `Workflow must have a ${triggerType === NodeType.WEBHOOK_TRIGGER ? "Webhook" : "Manual"} Trigger node to run.`,
    );
  }

  const order: WorkflowNode[] = [];
  const visited = new Set<string>();
  const queue = [trigger.id];

  while (queue.length > 0) {
    const nodeId = queue.shift();

    if (!nodeId || visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);
    const node = nodes.find((item) => item.id === nodeId);

    if (!node) {
      continue;
    }

    order.push(node);

    for (const edge of edges.filter((item) => item.source === nodeId)) {
      queue.push(edge.target);
    }
  }

  return order;
};
