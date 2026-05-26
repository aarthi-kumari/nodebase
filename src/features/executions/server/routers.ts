import { z } from "zod";

import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const executionsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(({ ctx }) => {
    return prisma.execution.findMany({
      where: { userId: ctx.auth.user.id },
      include: {
        workflow: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return prisma.execution.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
        include: {
          workflow: { select: { id: true, name: true } },
        },
      });
    }),
});
