import { EntityError } from "@/components/entity-components";
import { ExecutionDetail } from "@/features/executions/components/execution-detail";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { executionId } = await params;
  prefetchExecution(executionId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EntityError />}>
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center p-12">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ExecutionDetail executionId={executionId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
