import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";

import { WorkflowEditor } from "@/features/workflows/components/editor/workflow-editor";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{
    workflowsId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { workflowsId } = await params;

  prefetchWorkflow(workflowsId);
  prefetchCredentials();

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <WorkflowEditor workflowId={workflowsId} />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
