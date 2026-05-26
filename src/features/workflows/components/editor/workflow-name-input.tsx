"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useUpdateWorkflowName } from "../../hooks/use-workflow";

type WorkflowNameInputProps = {
  workflowId: string;
  name: string;
  className?: string;
};

export const WorkflowNameInput = ({
  workflowId,
  name,
  className,
}: WorkflowNameInputProps) => {
  const updateName = useUpdateWorkflowName();
  const [value, setValue] = useState(name);

  useEffect(() => {
    setValue(name);
  }, [name]);

  const commit = () => {
    const trimmed = value.trim();

    if (!trimmed) {
      setValue(name);
      return;
    }

    if (trimmed === name) {
      return;
    }

    updateName.mutate({ id: workflowId, name: trimmed });
  };

  return (
    <Input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setValue(name);
          event.currentTarget.blur();
        }
      }}
      disabled={updateName.isPending}
      className={cn(
        "h-8 border-transparent bg-transparent px-1 text-sm font-semibold shadow-none md:text-base",
        "hover:border-input hover:bg-background focus-visible:border-input focus-visible:bg-background",
        className,
      )}
      aria-label="Workflow name"
    />
  );
};
