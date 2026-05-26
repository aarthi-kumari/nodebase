"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getNodesByCategory,
  isTriggerNodeType,
  NODE_CATEGORIES,
  type NodeType,
} from "../../lib/node-types";

type NodeSelectorProps = {
  onSelect: (type: NodeType) => void;
  disabled?: boolean;
  hasTrigger?: boolean;
};

export const NodeSelector = ({
  onSelect,
  disabled,
  hasTrigger = false,
}: NodeSelectorProps) => {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-background">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Nodes</h2>
        <p className="text-xs text-muted-foreground">
          Click to add to the canvas
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {NODE_CATEGORIES.map((category, index) => {
            const nodes = getNodesByCategory(category);

            if (nodes.length === 0) {
              return null;
            }

            return (
              <div key={category}>
                {index > 0 ? <Separator className="mb-4" /> : null}
                <p className="mb-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {category}
                </p>
                <div className="space-y-1">
                  {nodes.map((node) => {
                    const Icon = node.icon;

                    return (
                      <Button
                        key={node.type}
                        variant="ghost"
                        className="h-auto w-full justify-start gap-3 px-2 py-2"
                        disabled={
                          disabled ||
                          (hasTrigger && isTriggerNodeType(node.type))
                        }
                        onClick={() => onSelect(node.type)}
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="truncate text-sm font-medium">
                            {node.label}
                          </p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {node.description}
                          </p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
};
