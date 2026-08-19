# Structured Output

### Status Breakdown

- `useObject` (UI Hook): Active and stable. It is designed to work seamlessly on the frontend with backend streaming.
- `generateObject` & `streamObject` (Core functions): Deprecated. You should replace them on your server/backend with generateText or streamText configured with structured output modes.

### For generating structured output use `object` key in streamText and pass zod schema then return the stream via toTextStream

```

export async function POST(request: NextRequest) {
  try {
    const result = streamText({
      model: groq("openai/gpt-oss-20b"),
      output: zodSchema,
      prompt: prompt,
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

```

And on the client side

```
const { object, submit, isLoading, stop } = useObject({
    api: "/api/structured-output",
    schema: heroesResponseSchema,
  });

{object?.elements?.map((hero, index) => (
        <div key={index}>
          <h3>{hero?.name}</h3>
          <p>
            <strong>Class:</strong> {hero?.class}
          </p>
          <p>{hero?.description}</p>
        </div>
      ))}
```

## Note : useObject does not preserve context or history unlike `useChat`

## For streaming responses the code works with gemini model not groq's model
