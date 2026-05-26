import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

import { getCredentialValue } from "@/features/credentials/lib/get-credential-value";

import { NodeType, type WorkflowNodeData } from "./node-types";

export type ExecutionLogEntry = {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  status: "success" | "failed";
  message?: string;
  output?: unknown;
  completedAt: string;
};

export type NodeExecutionContext = {
  previousOutput: unknown;
  triggerInput?: unknown;
};

const resolveSecret = async (
  userId: string,
  credentialId: string | undefined,
  envFallback: string | undefined,
  label: string,
): Promise<string> => {
  if (credentialId) {
    return getCredentialValue(userId, credentialId);
  }

  if (envFallback) {
    return envFallback;
  }

  throw new Error(
    `${label}: select a credential or configure an environment variable.`,
  );
};

const truncateDiscordContent = (content: string) => {
  const limit = 2000;

  if (content.length <= limit) {
    return content;
  }

  return `${Array.from(content).slice(0, limit - 3).join("")}...`;
};

export const executeNode = async (
  data: WorkflowNodeData,
  nodeId: string,
  context: NodeExecutionContext,
  userId: string,
): Promise<unknown> => {
  const config = data.config ?? {};

  switch (data.type) {
    case NodeType.MANUAL_TRIGGER:
      return { triggered: true, at: new Date().toISOString() };

    case NodeType.WEBHOOK_TRIGGER:
      return (
        context.triggerInput ?? {
          triggered: true,
          at: new Date().toISOString(),
        }
      );

    case NodeType.HTTP_REQUEST: {
      const url = config.url?.trim();
      if (!url) {
        throw new Error("HTTP Request node requires a URL.");
      }

      const method = config.method ?? "GET";
      const response = await fetch(url, { method });
      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(body)}`);
      }

      return { status: response.status, body };
    }

    case NodeType.GEMINI: {
      const apiKey = await resolveSecret(
        userId,
        config.credentialId,
        process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        "Gemini",
      );

      const prompt =
        config.prompt?.trim() ||
        (typeof context.previousOutput === "string"
          ? context.previousOutput
          : JSON.stringify(context.previousOutput));

      const google = createGoogleGenerativeAI({ apiKey });
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: "You are a helpful workflow assistant.",
        prompt,
      });

      return { text };
    }

    case NodeType.OPENAI: {
      const apiKey = await resolveSecret(
        userId,
        config.credentialId,
        process.env.OPENAI_API_KEY,
        "OpenAI",
      );

      const prompt =
        config.prompt?.trim() ||
        JSON.stringify(context.previousOutput ?? "Hello");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error?.message ?? "OpenAI request failed");
      }

      return { text: json.choices?.[0]?.message?.content ?? "" };
    }

    case NodeType.ANTHROPIC: {
      const apiKey = await resolveSecret(
        userId,
        config.credentialId,
        process.env.ANTHROPIC_API_KEY,
        "Anthropic",
      );

      const prompt =
        config.prompt?.trim() ||
        JSON.stringify(context.previousOutput ?? "Hello");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error?.message ?? "Anthropic request failed");
      }

      return {
        text: json.content?.find((c: { type: string }) => c.type === "text")
          ?.text,
      };
    }

    case NodeType.DISCORD:
    case NodeType.SLACK: {
      const webhookUrl = config.credentialId
        ? await getCredentialValue(userId, config.credentialId)
        : config.webhookUrl?.trim();

      if (!webhookUrl) {
        throw new Error(
          `${data.label}: select a credential or enter a webhook URL.`,
        );
      }

      const content =
        typeof context.previousOutput === "object" &&
        context.previousOutput !== null &&
        "text" in context.previousOutput
          ? String((context.previousOutput as { text: string }).text)
          : JSON.stringify(context.previousOutput);
      const webhookContent =
        data.type === NodeType.DISCORD
          ? truncateDiscordContent(content)
          : content;

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: webhookContent }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed (${response.status}): ${text}`);
      }

      return { sent: true, content: webhookContent };
    }

    default:
      throw new Error(`Unsupported node type: ${data.type}`);
  }
};
