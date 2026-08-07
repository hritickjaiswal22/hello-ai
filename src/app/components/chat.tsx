"use client";

import { useState } from "react";
import { ModelMessage } from "ai";

function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ModelMessage[]>([]);

  async function sendMessage() {
    if (!input.trim()) return;

    const arr: ModelMessage[] = [...messages];

    const userMessage: ModelMessage = {
      role: "user",
      content: input,
    };
    arr.push(userMessage);

    try {
      // Fetch connects directly to your app/api/chat/route.ts file
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: arr,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        arr.push({
          role: "assistant",
          content: data.data,
        });
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Network error failed to send message:", error);
    } finally {
      setInput("");
      setMessages(arr);
    }
  }

  console.log(messages);

  return (
    <div className="p-4">
      <input
        value={input}
        className="border"
        onChange={(e) => setInput(e.target.value)}
      />

      <button className="border cursor-pointer" onClick={sendMessage}>
        Submit
      </button>
    </div>
  );
}

export default Chat;
