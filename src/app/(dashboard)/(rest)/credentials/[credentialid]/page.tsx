import { requireAuth } from "@/lib/auth-utils";

interface PageProps{
    params: Promise<{
        credentialid: string
    }>
};

const Page = async ({params}: PageProps) => {
    await requireAuth();
    const { credentialid } = await params;
    return <p>Credential id: {credentialid}</p>
};

export default Page; 