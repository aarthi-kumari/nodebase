import type { LucideIcon } from "lucide-react";
import {
  BotIcon,
  GlobeIcon,
  MessageSquareIcon,
  PlayIcon,
  WebhookIcon,
} from "lucide-react";

export const WORKFLOW_NODE_TYPE = "workflow" as const;

export enum NodeType {
  MANUAL_TRIGGER = "MANUAL_TRIGGER",
  WEBHOOK_TRIGGER = "WEBHOOK_TRIGGER",
  HTTP_REQUEST = "HTTP_REQUEST",
  OPENAI = "OPENAI",
  ANTHROPIC = "ANTHROPIC",
  GEMINI = "GEMINI",
  DISCORD = "DISCORD",
  SLACK = "SLACK",
}

export type WorkflowNodeConfig = {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  prompt?: string;
  webhookUrl?: string;
  credentialId?: string;
};

export type WorkflowNodeData = {
  type: NodeType;
  label: string;
  description?: string;
  config?: WorkflowNodeConfig;
};

export type NodeCategory = "Triggers" | "AI" | "Integrations" | "Actions";

export const TRIGGER_NODE_TYPES = [
  NodeType.MANUAL_TRIGGER,
  NodeType.WEBHOOK_TRIGGER,
] as const;

export const isTriggerNodeType = (type: NodeType) =>
  TRIGGER_NODE_TYPES.includes(type as (typeof TRIGGER_NODE_TYPES)[number]);

export type NodeDefinition = {
  type: NodeType;
  label: string;
  description: string;
  category: NodeCategory;
  icon: LucideIcon;
  hasTarget: boolean;
  hasSource: boolean;
};

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  [NodeType.MANUAL_TRIGGER]: {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Run this workflow manually",
    category: "Triggers",
    icon: PlayIcon,
    hasTarget: false,
    hasSource: true,
  },
  [NodeType.WEBHOOK_TRIGGER]: {
    type: NodeType.WEBHOOK_TRIGGER,
    label: "Webhook Trigger",
    description: "Start this workflow from an HTTP POST",
    category: "Triggers",
    icon: WebhookIcon,
    hasTarget: false,
    hasSource: true,
  },
  [NodeType.HTTP_REQUEST]: {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Send an HTTP request",
    category: "Actions",
    icon: GlobeIcon,
    hasTarget: true,
    hasSource: true,
  },
  [NodeType.OPENAI]: {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Generate text with OpenAI",
    category: "AI",
    icon: BotIcon,
    hasTarget: true,
    hasSource: true,
  },
  [NodeType.ANTHROPIC]: {
    type: NodeType.ANTHROPIC,
    label: "Claude",
    description: "Generate text with Anthropic",
    category: "AI",
    icon: BotIcon,
    hasTarget: true,
    hasSource: true,
  },
  [NodeType.GEMINI]: {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Generate text with Google Gemini",
    category: "AI",
    icon: BotIcon,
    hasTarget: true,
    hasSource: true,
  },
  [NodeType.DISCORD]: {
    type: NodeType.DISCORD,
    label: "Discord",
    description: "Send a Discord message",
    category: "Integrations",
    icon: MessageSquareIcon,
    hasTarget: true,
    hasSource: true,
  },
  [NodeType.SLACK]: {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a Slack message",
    category: "Integrations",
    icon: MessageSquareIcon,
    hasTarget: true,
    hasSource: true,
  },
};

export const NODE_TYPE_OPTIONS = Object.values(NODE_DEFINITIONS).map(
  (definition) => ({
    value: definition.type,
    label: definition.label,
    category: definition.category,
  }),
);

export const NODE_CATEGORIES: NodeCategory[] = [
  "Triggers",
  "AI",
  "Integrations",
  "Actions",
];

export const getNodesByCategory = (category: NodeCategory) =>
  Object.values(NODE_DEFINITIONS).filter((node) => node.category === category);

export const createNodeData = (type: NodeType): WorkflowNodeData => {
  const definition = NODE_DEFINITIONS[type];
  return {
    type,
    label: definition.label,
    description: definition.description,
  };
};
