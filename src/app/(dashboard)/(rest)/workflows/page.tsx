import { EntityError } from "@/components/entity-components";
import { WorkflowsView } from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  await requireAuth();
  prefetchWorkflows();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EntityError />}>
        <WorkflowsView />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
