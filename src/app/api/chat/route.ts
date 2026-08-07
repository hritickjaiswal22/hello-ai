import { NextResponse, NextRequest } from "next/server";
import { groq, type GroqLanguageModelChatOptions } from "@ai-sdk/groq";
import { generateText, ModelMessage } from "ai";

export async function POST(request: NextRequest) {
  const data = await request.json(); // Safely parse incoming body

  const result = await generateText({
    model: groq("llama-3.1-8b-instant"),
    providerOptions: {},
    messages: data.messages,
  });

  console.log(result.output);

  return NextResponse.json(
    { success: true, data: result.output },
    { status: 201 },
  );
}
