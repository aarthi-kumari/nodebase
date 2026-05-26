import { EntityError } from "@/components/entity-components";
import {
  ExecutionsLoading,
  ExecutionsView,
} from "@/features/executions/components/executions";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  await requireAuth();
  prefetchExecutions();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EntityError />}>
        <Suspense fallback={<ExecutionsLoading />}>
          <ExecutionsView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
