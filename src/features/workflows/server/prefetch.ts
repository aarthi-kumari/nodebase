import { prefetch, trpc } from "@/trpc/server";

export const prefetchWorkflows = () => {
  return prefetch(trpc.workflows.getMany.queryOptions());
};

export const prefetchWorkflow = (id: string) => {
  return prefetch(trpc.workflows.getOne.queryOptions({ id }));
};
