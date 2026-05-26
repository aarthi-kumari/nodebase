import { TRPCError } from "@trpc/server";
import { z } from "zod";

import prisma from "@/lib/db";
import { generateWebhookSecret } from "@/lib/webhook-secret";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { ensureWorkflowWebhookSecret } from "../lib/ensure-webhook-secret";
import { createWorkflowNode, parseWorkflowNodes } from "../lib/graph";
import { createNodeData, NodeType } from "../lib/node-types";
import { toPrismaJson } from "../lib/serialize-graph";
import { startWorkflowExecution } from "../lib/start-workflow-execution";

const graphNodeSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.string(), z.unknown()),
  })
  .passthrough();

const graphEdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
  })
  .passthrough();

const defaultManualTriggerNode = () =>
  createWorkflowNode(
    NodeType.MANUAL_TRIGGER,
    { x: 0, y: 0 },
    createNodeData(NodeType.MANUAL_TRIGGER),
  );

export const workflowsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.workflow.create({
        data: {
          name: input.name?.trim() || "Untitled workflow",
          userId: ctx.auth.user.id,
          nodes: toPrismaJson([defaultManualTriggerNode()]),
          edges: toPrismaJson([]),
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  updateName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(120),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  updateGraph: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(graphNodeSchema),
        edges: z.array(graphEdgeSchema),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          nodes: toPrismaJson(input.nodes),
          edges: toPrismaJson(input.edges),
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!workflow) {
        return null;
      }

      return ensureWorkflowWebhookSecret(workflow.id);
    }),
  regenerateWebhookSecret: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      const nodes = parseWorkflowNodes(workflow.nodes);
      const hasWebhookTrigger = nodes.some(
        (node) => node.data.type === NodeType.WEBHOOK_TRIGGER,
      );

      if (!hasWebhookTrigger) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Add a Webhook Trigger node first.",
        });
      }

      return prisma.workflow.update({
        where: { id: input.id },
        data: { webhookSecret: generateWebhookSecret() },
      });
    }),
  getMany: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany({
      where: { userId: ctx.auth.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    });
  }),
  execute: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(({ ctx, input }) =>
      startWorkflowExecution({
        workflowId: input.workflowId,
        userId: ctx.auth.user.id,
        trigger: "manual",
      }),
    ),
});
