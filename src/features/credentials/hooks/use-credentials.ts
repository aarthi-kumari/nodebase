"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions());
};

export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.credentials.create.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        trpc.credentials.getMany.queryOptions(),
      );
      toast.success("Credential created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.credentials.update.mutationOptions(),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries(
        trpc.credentials.getMany.queryOptions(),
      );
      await queryClient.invalidateQueries(
        trpc.credentials.getOne.queryOptions({ id: variables.id }),
      );
      toast.success("Credential updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.credentials.remove.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        trpc.credentials.getMany.queryOptions(),
      );
      toast.success("Credential deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
