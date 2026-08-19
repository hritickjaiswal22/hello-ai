import { NextRequest } from "next/server";
import { streamText, Output, createTextStreamResponse, toTextStream } from "ai";
import { z } from "zod";
import { groq } from "@ai-sdk/groq";

export const heroesSchema = Output.array({
  element: z.object({
    name: z.string(),
    class: z.string(),
    description: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const result = streamText({
      model: groq("openai/gpt-oss-20b"),
      output: heroesSchema,
      prompt: "Generate 10 hero descriptions for a fantasy role playing game.",
    });

    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
    });
  } catch (error) {
    console.log("StructuredOutput Error - ", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
