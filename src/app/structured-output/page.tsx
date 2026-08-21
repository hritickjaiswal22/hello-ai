"use client";

import { useObject } from "@ai-sdk/react";
import { z } from "zod";

const heroesResponseSchema = z.object({
  elements: z.array(
    z.object({
      name: z.string(),
      class: z.string(),
      description: z.string(),
    }),
  ),
});

function StructuredOutput() {
  const { object, submit, isLoading, stop } = useObject({
    api: "/api/structured-output",
    schema: heroesResponseSchema,
  });

  console.log(object);

  return (
    <div>
      <button
        onClick={() => submit("generate")}
        type="button"
        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all duration-150 cursor-pointer"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        Start
      </button>

      <button
        onClick={stop}
        type="button"
        disabled={!isLoading}
        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm bg-rose-600/10 hover:bg-rose-600 active:bg-rose-700 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent transition-all duration-150 cursor-pointer"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
        Stop
      </button>

      {isLoading && <h1 className="text-7xl">Loading...</h1>}

      {/* Render the heroes as they stream in */}
      {object?.elements?.map((hero, index) => (
        <div key={index}>
          <h3>{hero?.name}</h3>
          <p>
            <strong>Class:</strong> {hero?.class}
          </p>
          <p>{hero?.description}</p>
        </div>
      ))}
    </div>
  );
}

export default StructuredOutput;
