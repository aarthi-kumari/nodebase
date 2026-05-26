import { NextResponse } from "next/server";

import { parseWorkflowNodes } from "@/features/workflows/lib/graph";
import { NodeType } from "@/features/workflows/lib/node-types";
import { startWorkflowExecution } from "@/features/workflows/lib/start-workflow-execution";
import prisma from "@/lib/db";
import {
  parseWebhookRequestBody,
  WebhookBodyError,
} from "@/lib/parse-webhook-body";
import { verifyWebhookSecret } from "@/lib/verify-webhook-secret";

const getProvidedSecret = (request: Request) => {
  const headerSecret = request.headers.get("x-webhook-secret");
  if (headerSecret) {
    return headerSecret;
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ workflowId: string }> },
) {
  const { workflowId } = await context.params;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  if (!verifyWebhookSecret(getProvidedSecret(request), workflow.webhookSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nodes = parseWorkflowNodes(workflow.nodes);
  const hasWebhookTrigger = nodes.some(
    (node) => node.data.type === NodeType.WEBHOOK_TRIGGER,
  );

  if (!hasWebhookTrigger) {
    return NextResponse.json(
      { error: "Workflow has no Webhook Trigger node" },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await parseWebhookRequestBody(request);
  } catch (error) {
    if (error instanceof WebhookBodyError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    const execution = await startWorkflowExecution({
      workflowId: workflow.id,
      userId: workflow.userId,
      trigger: "webhook",
      input: body ?? {},
    });

    return NextResponse.json({
      ok: true,
      executionId: execution.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start workflow";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
