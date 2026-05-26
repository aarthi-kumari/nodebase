"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
};

export const useUpdateWorkflowGraph = () => {
  const trpc = useTRPC();

  return useMutation(trpc.workflows.updateGraph.mutationOptions());
};

export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.workflows.updateName.mutationOptions(),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries(
        trpc.workflows.getOne.queryOptions({ id: variables.id }),
      );
      await queryClient.invalidateQueries(
        trpc.workflows.getMany.queryOptions(),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRegenerateWebhookSecret = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.workflows.regenerateWebhookSecret.mutationOptions(),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries(
        trpc.workflows.getOne.queryOptions({ id: variables.id }),
      );
      toast.success("Webhook secret regenerated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
