"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { trpc } from "@/trpc/server";


export const Client = () => {
    const trpc = useTRPC();
    const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());
    return (
        <div>
            Client components: {JSON.stringify(users)}
        </div>
    )
}