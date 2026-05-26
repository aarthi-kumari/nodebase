import prisma from "@/lib/db";
import { toPrismaJson } from "./serialize-graph";

import { parseWorkflowEdges, parseWorkflowNodes } from "./graph";
import {
  executeNode,
  type ExecutionLogEntry,
  type NodeExecutionContext,
} from "./execute-node";
import {
  getExecutionOrder,
  WorkflowExecutionError,
} from "./execution-order";
import { NodeType } from "./node-types";

export const runWorkflowExecution = async (executionId: string) => {
  const execution = await prisma.execution.findUnique({
    where: { id: executionId },
    include: { workflow: true },
  });

  if (!execution) {
    throw new WorkflowExecutionError("Execution not found.");
  }

  await prisma.execution.update({
    where: { id: executionId },
    data: { status: "RUNNING" },
  });

  const workflowNodes = parseWorkflowNodes(execution.workflow.nodes);
  const workflowEdges = parseWorkflowEdges(execution.workflow.edges);

  const hasWebhookTrigger = workflowNodes.some(
    (node) => node.data.type === NodeType.WEBHOOK_TRIGGER,
  );
  const hasManualTrigger = workflowNodes.some(
    (node) => node.data.type === NodeType.MANUAL_TRIGGER,
  );

  const triggerType =
    execution.input != null && hasWebhookTrigger
      ? NodeType.WEBHOOK_TRIGGER
      : hasManualTrigger
        ? NodeType.MANUAL_TRIGGER
        : hasWebhookTrigger
          ? NodeType.WEBHOOK_TRIGGER
          : NodeType.MANUAL_TRIGGER;

  const order = getExecutionOrder(workflowNodes, workflowEdges, {
    triggerType,
  });
  const logs: ExecutionLogEntry[] = [];
  const triggerInput = execution.input ?? undefined;

  let previousOutput: unknown = null;

  try {
    for (const node of order) {
      const context: NodeExecutionContext = { previousOutput, triggerInput };

      try {
        const output = await executeNode(
          node.data,
          node.id,
          context,
          execution.userId,
        );
        previousOutput = output;

        logs.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          status: "success",
          output,
          completedAt: new Date().toISOString(),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Node execution failed";

        logs.push({
          nodeId: node.id,
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          status: "failed",
          message,
          completedAt: new Date().toISOString(),
        });

        throw new Error(`${node.data.label}: ${message}`);
      }
    }

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: "SUCCESS",
        logs: toPrismaJson(logs),
        completedAt: new Date(),
      },
    });

    return { success: true, logs };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Workflow execution failed";

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: "FAILED",
        error: message,
        logs: toPrismaJson(logs),
        completedAt: new Date(),
      },
    });

    throw error;
  }
};
