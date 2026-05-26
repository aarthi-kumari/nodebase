import { EntityError } from "@/components/entity-components";
import {
  CredentialsLoading,
  CredentialsView,
} from "@/features/credentials/components/credentials";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  await requireAuth();
  prefetchCredentials();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EntityError />}>
        <Suspense fallback={<CredentialsLoading />}>
          <CredentialsView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
