import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { execute } from "@/inngest/functions";
import { executeWorkflow } from "@/inngest/functions/execute-workflow";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [execute, executeWorkflow],
});