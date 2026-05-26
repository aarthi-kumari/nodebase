import { TRPCError } from "@trpc/server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

import { parseWorkflowNodes } from "./graph";
import { NodeType, isTriggerNodeType } from "./node-types";
import { toPrismaJson } from "./serialize-graph";

export type WorkflowTriggerKind = "manual" | "webhook";

const triggerTypeForKind = (kind: WorkflowTriggerKind) =>
  kind === "webhook" ? NodeType.WEBHOOK_TRIGGER : NodeType.MANUAL_TRIGGER;

export const startWorkflowExecution = async ({
  workflowId,
  userId,
  trigger,
  input,
}: {
  workflowId: string;
  userId: string;
  trigger: WorkflowTriggerKind;
  input?: unknown;
}) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });

  if (!workflow) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workflow not found",
    });
  }

  const nodes = parseWorkflowNodes(workflow.nodes);
  const requiredTrigger = triggerTypeForKind(trigger);
  const hasTrigger = nodes.some((node) => node.data.type === requiredTrigger);

  if (!hasTrigger) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        trigger === "webhook"
          ? "Add a Webhook Trigger node to this workflow."
          : "Add a Manual Trigger node before running this workflow.",
    });
  }

  if (trigger === "webhook" && !workflow.webhookSecret) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Generate a webhook secret in the editor first.",
    });
  }

  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      userId,
      status: "PENDING",
      ...(trigger === "webhook"
        ? { input: toPrismaJson(input ?? {}) }
        : input !== undefined
          ? { input: toPrismaJson(input) }
          : {}),
    },
  });

  await inngest.send({
    name: "workflow/execute",
    data: { executionId: execution.id },
  });

  return execution;
};

export const workflowHasWebhookTrigger = (nodes: ReturnType<typeof parseWorkflowNodes>) =>
  nodes.some((node) => node.data.type === NodeType.WEBHOOK_TRIGGER);

export const countTriggerNodes = (nodes: ReturnType<typeof parseWorkflowNodes>) =>
  nodes.filter((node) => isTriggerNodeType(node.data.type)).length;
