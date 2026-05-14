
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

import { generateText } from 'ai';

export const appRouter = createTRPCRouter({
  testAi:protectedProcedure.mutation(async () => {
await inngest.send({
  name: "execute/ai",
  });

return { success: true, message: "Job queued" };
  }),
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

    return { success: true, message: "Job queued" };
  })
});

// export type definition of API
export type AppRouter = typeof appRouter;