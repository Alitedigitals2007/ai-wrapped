import OpenAI from "openai";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "./prompt";
import type { Analysis } from "./types";
import { mergeAnalysis } from "./types";

export type EngineProvider = "groq" | "openai";

type ClientConfig = {
  client: OpenAI;
  provider: EngineProvider;
  model: string;
};

function clientConfig(): ClientConfig | null {
  if (process.env.GROQ_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" }),
      provider: "groq",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      provider: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

export async function analyzeWithLLM(input: {
  username: string;
  aiUsed: string;
  text: string;
}): Promise<{ analysis: Analysis; provider: EngineProvider } | null> {
  const config = clientConfig();
  if (!config) return null;

  const { client, provider, model } = config;

  try {
    const completion = await client.chat.completions.create(
      {
        model,
        temperature: 0.4,
        max_tokens: 2500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: buildAnalysisUserPrompt(input) },
        ],
      },
      { signal: AbortSignal.timeout(60_000) }
    );

    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) return null;

    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const withProfile = {
      ...parsed,
      profile: {
        username: input.username,
        aiUsed: input.aiUsed,
        generatedDate: new Date().toISOString(),
      },
    };
    return { analysis: mergeAnalysis(withProfile as Partial<Analysis>), provider };
  } catch (error) {
    const status = (error as { status?: number })?.status;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`LLM analysis failed (${provider}, ${status ?? "unknown status"}): ${message}`);
    return null;
  }
}