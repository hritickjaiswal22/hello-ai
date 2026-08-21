# Tool Calling

While large language models (LLMs) have incredible generation capabilities, they struggle with discrete tasks (e.g. mathematics) and interacting with the outside world (e.g. getting the weather).

Tools are actions that an LLM can invoke. The results of these actions can be reported back to the LLM to be considered in the next response.

No, Vercel AI SDK tool calling and AI agent tool calling are not different concepts; rather, Vercel AI SDK is just a specific software tool you use to make AI agent tool calling happen.

Think of AI agent tool calling as the generic idea (like driving a car), while Vercel AI SDK is the specific tool or vehicle you use to do it (like driving a Tesla)

### What is a tool?

A tool is an object that can be called by the model to perform a specific task. You can use tools with `generateText` and `streamText` by passing one or more tools to the tools parameter.

A tool consists of three properties:

- description (optional)
- inputSchema
- execute (optional)

### Types of Tools

- **Function Tools** (Most Imp) :
  - Function tools are tools you define entirely yourself, including the description, input schema, and optional execute function. They are provider-agnostic and give you full control.

  - When to use: When you need full control, want provider portability, or are implementing application-specific functionality.

- **Dynamic Tools** :
  - Dynamic tools are function-style tools where the input and output types are not known at development time. They are useful for tools loaded from external sources, such as MCP servers, user-defined functions, or databases.

  - When to use: When tools are discovered or generated at runtime and their exact TypeScript input/output types are not known when you write the code.

- **Provider-Defined Tools** :
  - Provider-defined tools are tools where the provider specifies the tool's inputSchema and description, but you provide the execute function. These are sometimes called "client tools" because execution happens on your side.

  - When to use: When the provider offers a tool the model is trained to use well, and you want better performance for that specific task.

- **Provider-Executed Tools** :
  - Provider-executed tools are tools that run entirely on the provider's servers. You configure them, but the provider handles execution. These are sometimes called "server-side tools".

  - When to use: When you want powerful functionality (like web search or sandboxed code execution) without managing the infrastructure yourself.

### Type Inference for client

```
export const chatTools = {
  getWeather: weatherTool,
  ...
} satisfies ToolSet;

// 1. Infer the UI tools type mapping
export type ChatTools = InferUITools<typeof chatTools>;

// 2. Export the strongly-typed Message schema
export type CustomChatMessage = UIMessage<unknown, never, ChatTools>;
```

And then on client side

```
const { messages, sendMessage, error, status } = useChat<CustomChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/tool-calling" }),
  });

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
                  /// Any kid of handling like loading, error etc
                  break;
              }
            })}


state: "input-streaming" | "input-available" | "approval-requested" | "approval-responded" | "output-available" | "output-error" | "output-denied"
```
