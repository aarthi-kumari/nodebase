import { requireAuth } from "@/lib/auth-utils";

interface PageProps{
    params: Promise<{
        workflowsId: string
    }>
};

const Page = async ({params}: PageProps) => {
    await requireAuth();
    const { workflowsId } = await params;
    return <p>Workflows id: {workflowsId}</p>
};

export default Page; 