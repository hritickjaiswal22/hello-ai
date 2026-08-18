# Streaming

### What is streaming

Streaming sends data to the client in small pieces, called chunks, as soon as they're ready. Unlike traditional methods that wait for the entire response, streaming lets users start seeing and using content sooner. For example, a server can send the first part of an HTML page immediately, then stream in additional content as it's generated.

AI applications: Streaming responses from AIs powered by LLMs lets you display response text as it arrives rather than waiting for the full result

```
export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      messages: modelMessages,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
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
}

```

### convertToModelMessages

The message received from useChat are of the form `UIMessage[]`

```
[ { parts: [ [Object] ], id: 'tSjShLEQZ3AUJhDE', role: 'user' } ]
```

but it needs to be coverted to ModelMessage learned earlier so it is used

### Sending error `new Response(...)` to be used on route function

For the useChat to receive error new Response must be used not NextResponse.json(...) otherwise error is not detected

### For retrying last message use `regenerate()`

```
onClick={() => regenerate()} // Without any args to be used for last message retry
```

### status `submitted` : The message has been sent to the API and we're awaiting the start of the response stream.

Use above for showing loader before streaming begins

### status === "streaming" || status === "submitted" ? "Stop" : "Send"

For button disables and retries

### Network Response

![alt text](./assets/Network%20Response%20for%20Streaming.png)

## Concepts

### ReadableStream

A ReadableStream in JavaScript is part of the Streams API, **which provides a way to handle streaming data**. This can be particularly useful for reading data from sources like network requests, files, or any other data source that provides data in chunks over time.

Key Features

- **Streaming Data**: Allows you to read data in chunks as it becomes available, rather than waiting for the entire data to be loaded.
- **Backpressure Handling**: Manages the flow of data to prevent overwhelming the consumer with too much data at once.

### Server Sent Events

**Server-Sent Events (SSE)** is a mechanism that lets a server push real‑time updates to a client **over a standard HTTP connection**. It is **not** a separate protocol like WebSocket.

Here’s the distinction:

|             | **SSE**                                                                                                                                | **WebSocket**                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Protocol    | **Plain HTTP** – no upgrade, no new handshake.                                                                                         | Starts as HTTP, then **upgrades** to the `ws://` (or `wss://`) protocol via a 101 Switching Protocols response. |
| Direction   | **Unidirectional** (server → client only). Client sends data only to initiate the connection (and for possible reconnection requests). | **Bidirectional** (full duplex). Both sides can send at any time.                                               |
| Data format | UTF‑8 text, formatted as `field: value` lines (e.g., `data: {…}\n\n`).                                                                 | Binary or text frames (any format).                                                                             |
| Browser API | `EventSource` object – built‑in auto‑reconnect, event‑ID tracking, and event‑type filtering.                                           | `WebSocket` object – manual reconnection, custom framing.                                                       |
| Transport   | Standard HTTP/1.1 long‑lived connection (or HTTP/2 stream). Works natively through proxies and firewalls.                              | A separate TCP‑based protocol that often requires special proxy configuration.                                  |

**How SSE works in a nutshell:**

1. The client makes a normal HTTP `GET` request with `Accept: text/event-stream`.
2. The server responds with `Content-Type: text/event-stream` and keeps the response body open.
3. The server writes text lines like:

   ```
   data: {"message": "hello"}

   ```

   (a blank line terminates an event). The browser’s `EventSource` parses these and fires `message` events.

So **no protocol upgrade** – SSE is just HTTP streaming, repurposing the same HTTP connection for continuous server-to-client data. That’s why `createUIMessageStreamResponse` returns a standard `Response` object: it’s simply an HTTP response whose body is an SSE stream. The client can consume it with an `EventSource` or by reading a `ReadableStream` from a `fetch` call.

In the AI SDK, this lets the server stream token-by-token UI updates while the client just listens – exactly the use case SSE was designed for.

**So basically it is a normal HTTP connection only but the response body is kept open allowing the server to push data to client hence allowing the server to stream data to client in real time**

### Ok then why convert the stream to SSE I mean by streams only the browser should be able to read incoming data in chunks ???

You’re absolutely right that a browser can already read an HTTP response as a raw stream of chunks using `response.body.getReader()`. So why wrap that stream in SSE instead of just sending, say, newline-delimited JSON?

The conversion to **SSE** provides several practical benefits that a raw custom stream doesn’t give you out of the box:

---

### 1. **Browser-Native Parsing with `EventSource`**

SSE is a web standard. Browsers have a built‑in `EventSource` API that automatically:

- Parses the `data:` lines,
- Fires a `message` event for every complete event,
- Handles reconnection if the connection drops,
- Tracks the last received event ID (`Last-Event-ID`) so the server can resume from where the client left off.

With a raw stream, you’d have to implement your own custom reader, line buffering, JSON parsing, error recovery, and reconnection logic. SSE gives you all of that for free.

---

### 2. **Automatic Reconnection**

If the connection breaks, `EventSource` automatically tries to reconnect. It sends the `Last-Event-ID` header, enabling the server to continue sending events that the client missed. A raw stream would just fail, and you’d have to build your own retry mechanism.

---

### 3. **Named Events & Structural Metadata**

SSE lets you tag different types of messages using the `event:` field:

```
event: text-delta
data: {"content": "Hello"}

event: tool-call
data: {"name": "search", "args": {...}}
```

This cleanly separates different kinds of updates without the client needing to inspect the payload structure. In a raw JSON stream you’d need a `type` field inside the JSON and a hand‑rolled dispatcher.

---

### 4. **Convention & Ecosystem Compatibility**

The Vercel AI SDK’s client‑side hooks (e.g., `useChat`) **expect** SSE. By converting the internal `UIMessage` stream to SSE, the server adheres to a well‑known protocol that the SDK’s frontend automatically understands. This keeps the client code simple and consistent.

---

**Could you skip SSE?**  
Yes, absolutely. Some implementations stream raw JSON Lines (or even binary) and parse them with a custom reader. But then you lose the automatic reconnection, event typing, and the `EventSource` simplicity. SSE is just a mature, low‑effort way to turn a server stream into a robust, client‑friendly event feed.

So in short: the conversion is **not strictly necessary** to stream data, but it’s the **simplest, most reliable way** to make that stream work out‑of‑the‑box in a browser, with all the “stream management” handled by the platform.
