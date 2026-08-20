import { NextRequest } from "next/server";
import {
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  tool,
} from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

import { chatTools } from "@/app/lib/tools";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const messages = await convertToModelMessages(body.messages);

    const { stream } = streamText({
      model: groq("openai/gpt-oss-20b"),
      messages,
      tools: chatTools,
      toolChoice: "auto",
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: stream,
      }),
    });
  } catch (error) {
    console.log("Error - ", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
