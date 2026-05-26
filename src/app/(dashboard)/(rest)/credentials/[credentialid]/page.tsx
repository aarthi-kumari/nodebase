import { EntityError } from "@/components/entity-components";
import { CredentialDetail } from "@/features/credentials/components/credential-detail";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{
    credentialid: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialid } = await params;
  prefetchCredential(credentialid);

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
          <CredentialDetail credentialId={credentialid} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
