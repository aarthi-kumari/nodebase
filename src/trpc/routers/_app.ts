
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.input(z.void()).mutation(async () => {
    await inngest.send({
      name: 'test/hello.world',
      data: {
        timestamp: new Date().toISOString(),
      },
    });

    return { ok: true };
  })
});

// export type definition of API
export type AppRouter = typeof appRouter;