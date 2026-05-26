"use client";

import {
  ArrowLeftIcon,
  Loader2Icon,
  PlayIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { WorkflowNameInput } from "./workflow-name-input";

type EditorHeaderProps = {
  workflowId: string;
  workflowName: string;
  saveStatus: "saved" | "saving" | "unsaved";
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onRun?: () => void;
  isRunning?: boolean;
};

export const EditorHeader = ({
  workflowId,
  workflowName,
  saveStatus,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onRun,
  isRunning = false,
}: EditorHeaderProps) => {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/workflows">
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back to workflows</span>
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <WorkflowNameInput
            workflowId={workflowId}
            name={workflowName}
            className="max-w-md"
          />
          <p className="hidden text-xs text-muted-foreground sm:block">
            Select a node or edge, then press Delete to remove · Ctrl+Z to undo
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button onClick={onRun} disabled={isRunning} size="sm">
          {isRunning ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <PlayIcon className="size-4" />
          )}
          Run
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2Icon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2Icon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>
        <SaveStatusIndicator status={saveStatus} />
      </div>
    </header>
  );
};

const SaveStatusIndicator = ({
  status,
}: {
  status: EditorHeaderProps["saveStatus"];
}) => {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" />
        Saving...
      </span>
    );
  }

  if (status === "unsaved") {
    return (
      <span className="text-xs text-muted-foreground">Unsaved changes</span>
    );
  }

  return <span className="text-xs text-muted-foreground">Saved</span>;
};
