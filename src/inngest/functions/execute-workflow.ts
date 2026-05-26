import * as Sentry from "@sentry/nextjs";

import { runWorkflowExecution } from "@/features/workflows/lib/run-workflow";
import { inngest } from "../client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { executionId } = event.data as { executionId: string };

    return step.run("run-workflow", async () => {
      try {
        return await runWorkflowExecution(executionId);
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  },
);
