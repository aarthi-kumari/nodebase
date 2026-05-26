import prisma from "@/lib/db";
import { generateWebhookSecret } from "@/lib/webhook-secret";

import { parseWorkflowNodes } from "./graph";
import { NodeType } from "./node-types";

export const ensureWorkflowWebhookSecret = async (workflowId: string) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow) {
    return null;
  }

  const nodes = parseWorkflowNodes(workflow.nodes);
  const hasWebhookTrigger = nodes.some(
    (node) => node.data.type === NodeType.WEBHOOK_TRIGGER,
  );

  if (!hasWebhookTrigger) {
    return workflow;
  }

  if (workflow.webhookSecret) {
    return workflow;
  }

  return prisma.workflow.update({
    where: { id: workflowId },
    data: { webhookSecret: generateWebhookSecret() },
  });
};
