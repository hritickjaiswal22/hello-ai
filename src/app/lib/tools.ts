import { tool, type ToolSet, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";

import { getCityWeather } from "@/app/lib/weather";
import { getCityTime } from "@/app/lib/city-time";

export const weatherTool = tool({
  description: "Get the weather in a city",
  inputSchema: z.object({
    cityName: z.string().describe("The city to get the weather for"),
  }),
  execute: getCityWeather,
});

export const cityTimeTool = tool({
  description: "Get the current time and timezone for a city",
  inputSchema: z.object({
    cityName: z.string().describe("The city to get the time info for"),
  }),
  execute: getCityTime,
});

export const chatTools = {
  getWeather: weatherTool,
  getCityTime: cityTimeTool,
} satisfies ToolSet;

// 1. Infer the UI tools type mapping
export type ChatTools = InferUITools<typeof chatTools>;

// 2. Export the strongly-typed Message schema
export type CustomChatMessage = UIMessage<unknown, never, ChatTools>;
