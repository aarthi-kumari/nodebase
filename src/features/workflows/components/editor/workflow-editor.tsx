"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import {
  createWorkflowNode,
  parseWorkflowEdges,
  parseWorkflowNodes,
  type WorkflowEdge,
  type WorkflowNode,
} from "../../lib/graph";
import {
  createNodeData,
  isTriggerNodeType,
  NodeType,
  WORKFLOW_NODE_TYPE,
} from "../../lib/node-types";
import {
  useSuspenseWorkflow,
  useUpdateWorkflowGraph,
} from "../../hooks/use-workflow";
import { useExecuteWorkflow } from "../../hooks/use-execute-workflow";
import { useUndoRedo } from "../../hooks/use-undo-redo";
import type { WorkflowNodeData } from "../../lib/node-types";
import { BaseNode } from "./base-node";
import { EditorHeader } from "./editor-header";
import { NodeConfigPanel } from "./node-config-panel";
import { NodeSelector } from "./node-selector";

const nodeTypes = {
  [WORKFLOW_NODE_TYPE]: BaseNode,
};

type WorkflowEditorProps = {
  workflowId: string;
};

const isSignificantNodeChange = (changes: NodeChange<WorkflowNode>[]) =>
  changes.some(
    (change) =>
      change.type === "add" ||
      change.type === "remove" ||
      (change.type === "position" &&
        "dragging" in change &&
        change.dragging === false),
  );

const isSignificantEdgeChange = (changes: EdgeChange<WorkflowEdge>[]) =>
  changes.some(
    (change) => change.type === "add" || change.type === "remove",
  );

const WorkflowEditorCanvas = ({ workflowId }: WorkflowEditorProps) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateGraph = useUpdateWorkflowGraph();
  const { screenToFlowPosition } = useReactFlow();

  if (!workflow) {
    notFound();
  }

  const initialNodes = useMemo(
    () => parseWorkflowNodes(workflow.nodes),
    [workflow.nodes],
  );
  const initialEdges = useMemo(
    () => parseWorkflowEdges(workflow.edges),
    [workflow.edges],
  );

  const [nodes, setNodes, onNodesChangeInternal] =
    useNodesState<WorkflowNode>(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] =
    useEdgesState<WorkflowEdge>(initialEdges);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );
  const skipSaveRef = useRef(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const executeWorkflow = useExecuteWorkflow();

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(
    nodes,
    edges,
    setNodes,
    setEdges,
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      if (isSignificantNodeChange(changes)) {
        takeSnapshot();
      }
      onNodesChangeInternal(changes);
    },
    [onNodesChangeInternal, takeSnapshot],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowEdge>[]) => {
      if (isSignificantEdgeChange(changes)) {
        takeSnapshot();
      }
      onEdgesChangeInternal(changes);
    },
    [onEdgesChangeInternal, takeSnapshot],
  );

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    setSaveStatus("unsaved");

    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      updateGraph.mutate(
        {
          id: workflowId,
          nodes: nodes.map((node) => ({
            ...node,
            type: node.type ?? WORKFLOW_NODE_TYPE,
          })),
          edges,
        },
        {
          onSuccess: () => setSaveStatus("saved"),
          onError: (error) => {
            setSaveStatus("unsaved");
            toast.error(error.message);
          },
        },
      );
    }, 800);

    return () => window.clearTimeout(timer);
  }, [nodes, edges, workflowId, updateGraph.mutate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) {
        return;
      }

      const isMod = event.ctrlKey || event.metaKey;

      if (isMod && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if (
        isMod &&
        (event.key.toLowerCase() === "y" ||
          (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot();
      setEdges((current) => addEdge(connection, current));
    },
    [setEdges, takeSnapshot],
  );

  const hasManualTrigger = useMemo(
    () => nodes.some((node) => node.data.type === NodeType.MANUAL_TRIGGER),
    [nodes],
  );

  const hasTrigger = useMemo(
    () => nodes.some((node) => isTriggerNodeType(node.data.type)),
    [nodes],
  );

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const hasTrigger = nodes.some((node) => isTriggerNodeType(node.data.type));

      if (isTriggerNodeType(type) && hasTrigger) {
        toast.error("Only one trigger node is allowed per workflow");
        return;
      }

      takeSnapshot();

      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const newNode = createWorkflowNode(
        type,
        position,
        createNodeData(type),
      );

      setNodes((current) => [...current, newNode]);
    },
    [nodes, screenToFlowPosition, setNodes, takeSnapshot],
  );

  const handleUpdateNode = useCallback(
    (
      nodeId: string,
      data: WorkflowNodeData,
      options?: { recordHistory?: boolean },
    ) => {
      if (options?.recordHistory) {
        takeSnapshot();
      }
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId ? { ...node, data } : node,
        ),
      );
    },
    [setNodes, takeSnapshot],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      takeSnapshot();
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId,
        ),
      );
      setSelectedNodeId(null);
    },
    [setNodes, setEdges, takeSnapshot],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: WorkflowNode[] }) => {
      setSelectedNodeId(
        selectedNodes.length === 1 ? selectedNodes[0].id : null,
      );
    },
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <EditorHeader
        workflowId={workflowId}
        workflowName={workflow.name}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onRun={() => {
          if (!hasManualTrigger) {
            toast.error("Add a Manual Trigger node to run from the editor");
            return;
          }

          executeWorkflow.mutate(
            { workflowId },
            {
              onSuccess: (execution) => {
                toast.success("Workflow run started");
                window.location.href = `/executions/${execution.id}`;
              },
              onError: (error) => toast.error(error.message),
            },
          );
        }}
        isRunning={executeWorkflow.isPending}
      />
      <div className="flex min-h-0 flex-1">
        <NodeSelector
          onSelect={handleAddNode}
          disabled={updateGraph.isPending}
          hasTrigger={hasTrigger}
        />
        <div className="relative h-full min-h-0 flex-1">
          <ReactFlow
            className="h-full w-full"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={["Backspace", "Delete"]}
            multiSelectionKeyCode={null}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <NodeConfigPanel
          workflowId={workflowId}
          webhookSecret={workflow.webhookSecret}
          selectedNode={selectedNode}
          nodes={nodes}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      </div>
    </div>
  );
};

export const WorkflowEditor = ({ workflowId }: WorkflowEditorProps) => {
  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <WorkflowEditorCanvas workflowId={workflowId} />
      </ReactFlowProvider>
    </TooltipProvider>
  );
};
