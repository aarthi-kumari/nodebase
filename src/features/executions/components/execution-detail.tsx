"use client";

import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EntityContainer } from "@/components/entity-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExecutionLogEntry } from "@/features/workflows/lib/execute-node";

import { Loader2Icon } from "lucide-react";

import { useExecution } from "../hooks/use-executions";

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

export const ExecutionDetail = ({ executionId }: { executionId: string }) => {
  const { data: execution, isLoading } = useExecution(executionId);

  if (isLoading && !execution) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!execution) {
    notFound();
  }

  const logs = Array.isArray(execution.logs)
    ? (execution.logs as ExecutionLogEntry[])
    : [];

  return (
    <EntityContainer className="space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/executions">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <header className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{execution.workflow.name}</h1>
            <Badge variant={statusVariant(execution.status)}>
              {execution.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Started {format(new Date(execution.startedAt), "PPpp")}
            {execution.completedAt
              ? ` · Completed ${format(new Date(execution.completedAt), "PPpp")}`
              : null}
          </p>
        </header>
      </section>

      {execution.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {execution.error}
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Step logs</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {execution.status === "RUNNING" || execution.status === "PENDING"
              ? "Execution in progress..."
              : "No step logs recorded."}
          </p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li
                key={`${log.nodeId}-${log.completedAt}`}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{log.nodeLabel}</p>
                  <Badge
                    variant={
                      log.status === "success" ? "default" : "destructive"
                    }
                  >
                    {log.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.nodeType}
                </p>
                {log.message ? (
                  <p className="mt-2 text-sm text-destructive">{log.message}</p>
                ) : null}
                {log.output ? (
                  <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                    {JSON.stringify(log.output, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </EntityContainer>
  );
};
