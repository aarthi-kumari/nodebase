import type { Edge, Node } from "@xyflow/react";

import type { WorkflowNodeData } from "./node-types";
import { WORKFLOW_NODE_TYPE } from "./node-types";

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export const parseWorkflowNodes = (value: unknown): WorkflowNode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as WorkflowNode[];
};

export const parseWorkflowEdges = (value: unknown): WorkflowEdge[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as WorkflowEdge[];
};

export const createWorkflowNode = (
  type: WorkflowNodeData["type"],
  position: { x: number; y: number },
  data: WorkflowNodeData,
): WorkflowNode => ({
  id: crypto.randomUUID(),
  type: WORKFLOW_NODE_TYPE,
  position,
  data,
});
