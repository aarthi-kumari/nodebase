import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { parseWorkflowNodes } from "@/features/workflows/lib/graph";
import {
  encryptCredentialValue,
  getCredentialLastFour,
} from "@/lib/credentials-crypto";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const credentialTypeSchema = z.enum([
  "OPENAI",
  "ANTHROPIC",
  "GEMINI",
  "DISCORD",
  "SLACK",
]);

const toPublicCredential = (credential: {
  id: string;
  name: string;
  type: string;
  lastFour: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: credential.id,
  name: credential.name,
  type: credential.type,
  maskedValue: `••••${credential.lastFour}`,
  lastFour: credential.lastFour,
  createdAt: credential.createdAt,
  updatedAt: credential.updatedAt,
});

export const credentialsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(({ ctx }) => {
    return prisma.credential
      .findMany({
        where: { userId: ctx.auth.user.id },
        orderBy: { updatedAt: "desc" },
      })
      .then((items) => items.map(toPublicCredential));
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found",
        });
      }

      const workflows = await prisma.workflow.findMany({
        where: { userId: ctx.auth.user.id },
        select: { id: true, name: true, nodes: true },
      });

      const usedInWorkflows = workflows
        .filter((workflow) => {
          const nodes = parseWorkflowNodes(workflow.nodes);
          return nodes.some(
            (node) => node.data.config?.credentialId === input.id,
          );
        })
        .map(({ id, name }) => ({ id, name }));

      return {
        ...toPublicCredential(credential),
        usedInWorkflows,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: credentialTypeSchema,
        value: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return prisma.credential
        .create({
          data: {
            name: input.name,
            type: input.type,
            value: encryptCredentialValue(input.value),
            lastFour: getCredentialLastFour(input.value),
            userId: ctx.auth.user.id,
          },
        })
        .then(toPublicCredential);
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.credential.delete({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        value: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.credential.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found",
        });
      }

      return prisma.credential
        .update({
          where: { id: input.id },
          data: {
            name: input.name,
            ...(input.value
              ? {
                  value: encryptCredentialValue(input.value),
                  lastFour: getCredentialLastFour(input.value),
                }
              : {}),
          },
        })
        .then(toPublicCredential);
    }),
});
