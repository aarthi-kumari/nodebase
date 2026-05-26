import { NodeType } from "@/features/workflows/lib/node-types";

export const CREDENTIAL_TYPE_LABELS = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GEMINI: "Google Gemini",
  DISCORD: "Discord",
  SLACK: "Slack",
} as const;

export type CredentialTypeName = keyof typeof CREDENTIAL_TYPE_LABELS;

export const CREDENTIAL_TYPE_OPTIONS = Object.entries(
  CREDENTIAL_TYPE_LABELS,
).map(([value, label]) => ({
  value: value as CredentialTypeName,
  label,
}));

export const nodeTypeToCredentialType = (
  nodeType: NodeType,
): CredentialTypeName | null => {
  switch (nodeType) {
    case NodeType.OPENAI:
      return "OPENAI";
    case NodeType.ANTHROPIC:
      return "ANTHROPIC";
    case NodeType.GEMINI:
      return "GEMINI";
    case NodeType.DISCORD:
      return "DISCORD";
    case NodeType.SLACK:
      return "SLACK";
    default:
      return null;
  }
};

export const nodeUsesCredential = (nodeType: NodeType) =>
  nodeTypeToCredentialType(nodeType) !== null;
