"use client";

import { ChatStatus } from "ai";
import { useState } from "react";

interface StreamInputProps {
  status: ChatStatus;
  submitHandler: (input: string) => void;
}

function StreamInput({ status, submitHandler }: StreamInputProps) {
  const [input, setInput] = useState("");

  function handleButtonClick() {
    if (!input.trim()) return;

    submitHandler(input);
    setInput("");
  }

  return (
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
          onClick={handleButtonClick}
          type="submit"
          className="px-5 py-2 text-base font-medium text-white bg-indigo-600 rounded-full transition-colors hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
        >
          {status === "streaming" || status === "submitted" ? "Stop" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default StreamInput;
