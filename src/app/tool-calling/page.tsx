"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import StreamInput from "../components/stream-input";
import { MemoizedMarkdown } from "../components/memoized-markdown";
import { CustomChatMessage } from "@/app/lib/tools";

function ToolCalling() {
  const { messages, sendMessage, error, status } = useChat<CustomChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/tool-calling" }),
  });

  function submitHandler(input: string) {
    if (status === "streaming" || status === "submitted") {
      stop();
    } else if (input && input.trim()) {
      sendMessage({ text: input });
    }
  }

  console.log(messages);

  return (
    <div className="p-8">
      <div className="flex flex-col w-full max-w-md py-4 mx-auto stretch">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user" ? "user-content" : "whitespace-pre-wrap"
            }
          >
            {message.role === "user" ? "User: " : "AI: "}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <MemoizedMarkdown
                      key={`${message.id}-text`}
                      id={message.id}
                      content={part.text}
                    />
                  );
                  break;

                case "tool-getWeather":
                  if (part.state === "output-available")
                    return (
                      <h1
                        key={part.toolCallId}
                      >{`Temperature ${part.output.temperature}`}</h1>
                    );
                  else return null;
                  break;

                case "tool-getCityTime":
                  if (part.state === "output-available")
                    return (
                      <h1
                        key={part.toolCallId}
                      >{`Current time in ${part.output.city} is ${new Date(part.output.datetime).toLocaleTimeString()}`}</h1>
                    );
                  else return null;
                  break;
              }
            })}
          </div>
        ))}

        {status === "submitted" && (
          <div className="flex w-fit mx-auto items-center justify-between gap-4 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md shadow-sm font-sans">
            <svg
              className="animate-spin h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {error && (
          <div className="flex mx-auto items-center gap-3 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-full max-w-sm shadow-sm font-sans">
            <span className="text-lg" aria-hidden="true">
              ⚠️
            </span>

            <div className="flex flex-col flex-1">
              <p className="text-xs font-semibold leading-tight">
                Couldn't load content
              </p>
              <p className="text-[11px] text-red-600 leading-tight">
                Check your connection and try again.
              </p>
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer">
              Retry
            </button>
          </div>
        )}
      </div>

      <StreamInput status={status} submitHandler={submitHandler} />
    </div>
  );
}

export default ToolCalling;
