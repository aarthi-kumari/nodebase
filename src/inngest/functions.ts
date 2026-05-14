
import prisma from "@/lib/db";
import { inngest } from "./client";
import {generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI()

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend", "5s");



  const {steps } = await step.ai.wrap("gemini-generate-text",
    generateText, 
    {
      model: google('gemini-2.5-flash'),
      system: "You are a helpful assistant.",
      prompt: "What is 2 + 2?",
    }
  );

  return steps;
  },
);