"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getMany.queryOptions());
};

export const useExecution = (id: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.executions.getOne.queryOptions({ id }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PENDING" || status === "RUNNING") {
        return 2000;
      }
      return false;
    },
  });
};

export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
