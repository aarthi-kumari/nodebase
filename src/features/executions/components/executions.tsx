"use client";

import { formatDistanceToNow } from "date-fns";
import { HistoryIcon } from "lucide-react";
import Link from "next/link";

import {
  EntityContainer,
  EntityEmpty,
  EntityGrid,
  EntityHeader,
  EntityLoading,
} from "@/components/entity-components";
import { Badge } from "@/components/ui/badge";
import { useSuspenseExecutions } from "../hooks/use-executions";

const statusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "SUCCESS":
      return "default";
    case "FAILED":
      return "destructive";
    case "RUNNING":
      return "secondary";
    default:
      return "outline";
  }
};

const ExecutionsList = () => {
  const { data: executions } = useSuspenseExecutions();

  if (executions.length === 0) {
    return (
      <EntityEmpty
        title="No executions yet"
        description="Run a workflow from the editor to see execution history here."
        icon={<HistoryIcon />}
      />
    );
  }

  return (
    <EntityGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {executions.map((execution) => (
        <Link
          key={execution.id}
          href={`/executions/${execution.id}`}
          className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/30"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {execution.workflow.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(execution.startedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Badge variant={statusVariant(execution.status)}>
              {execution.status}
            </Badge>
          </div>
          {execution.error ? (
            <p className="line-clamp-2 text-xs text-destructive">
              {execution.error}
            </p>
          ) : null}
        </Link>
      ))}
    </EntityGrid>
  );
};

export const ExecutionsView = () => {
  return (
    <EntityContainer className="space-y-6">
      <EntityHeader
        title="Executions"
        description="History of workflow runs"
      />
      <ExecutionsList />
    </EntityContainer>
  );
};

export const ExecutionsLoading = () => (
  <EntityContainer className="space-y-6">
    <EntityHeader title="Executions" description="History of workflow runs" />
    <EntityLoading count={6} />
  </EntityContainer>
);
