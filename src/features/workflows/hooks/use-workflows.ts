"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

export type WorkflowListItem = {
  id: string;
  name: string;
  updatedAt: Date;
};

type SuspenseWorkflowsResult = {
  data: WorkflowListItem[];
};

export const useSuspenseWorkflows = (): SuspenseWorkflowsResult => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions()) as SuspenseWorkflowsResult;
};

export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    ...trpc.workflows.create.mutationOptions(),
    onSuccess: async (workflow, _variables) => {
      await queryClient.invalidateQueries(
        trpc.workflows.getMany.queryOptions(),
      );
      toast.success("Workflow created");
      router.push(`/workflows/${workflow.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.workflows.remove.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        trpc.workflows.getMany.queryOptions(),
      );
      toast.success("Workflow deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
