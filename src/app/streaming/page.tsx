"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo, useState } from "react";
import { DefaultChatTransport } from "ai";

function StreamingPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, error, status, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/streaming" }),
  });
  const stableMessages = useMemo(() => messages, [messages.length]);

  function submitHandler() {
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  }

  return (
    <section>
      <div className="flex flex-col w-full max-w-md py-4 mx-auto stretch">
        {stableMessages.map((message) => (
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
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
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

            <button
              onClick={() => regenerate()}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full pb-4">
        <div className="flex mx-auto items-center w-full max-w-md p-1.5 bg-white border-2 border-slate-200 rounded-full shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15">
          <input
            type="text"
            placeholder="Search anything..."
            className="flex-1 min-w-0 px-4 py-2 text-base text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={
              status === "streaming" || status === "submitted"
                ? stop
                : submitHandler
            }
            type="submit"
            className="px-5 py-2 text-base font-medium text-white bg-indigo-600 rounded-full transition-colors hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
          >
            {status === "streaming" || status === "submitted" ? "Stop" : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default StreamingPage;
