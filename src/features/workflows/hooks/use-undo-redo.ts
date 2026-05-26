"use client";

import { useCallback, useRef, useState } from "react";

import type { WorkflowEdge, WorkflowNode } from "../lib/graph";

type GraphSnapshot = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

const cloneSnapshot = (snapshot: GraphSnapshot): GraphSnapshot => ({
  nodes: structuredClone(snapshot.nodes),
  edges: structuredClone(snapshot.edges),
});

const MAX_HISTORY = 50;

export const useUndoRedo = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>,
) => {
  const pastRef = useRef<GraphSnapshot[]>([]);
  const futureRef = useRef<GraphSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const takeSnapshot = useCallback(() => {
    pastRef.current.push(cloneSnapshot({ nodes, edges }));

    if (pastRef.current.length > MAX_HISTORY) {
      pastRef.current.shift();
    }

    futureRef.current = [];
    syncFlags();
  }, [nodes, edges, syncFlags]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) {
      return;
    }

    futureRef.current.push(cloneSnapshot({ nodes, edges }));
    const previous = pastRef.current.pop();

    if (!previous) {
      return;
    }

    setNodes(previous.nodes);
    setEdges(previous.edges);
    syncFlags();
  }, [nodes, edges, setNodes, setEdges, syncFlags]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) {
      return;
    }

    pastRef.current.push(cloneSnapshot({ nodes, edges }));
    const next = futureRef.current.pop();

    if (!next) {
      return;
    }

    setNodes(next.nodes);
    setEdges(next.edges);
    syncFlags();
  }, [nodes, edges, setNodes, setEdges, syncFlags]);

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
