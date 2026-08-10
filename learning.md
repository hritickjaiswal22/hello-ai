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
