import OpenAI from "openai";
import type { DimensionScores } from "./dimensions";
import type { PersonalityReport } from "./types";
import { mergeReport, normalizeHighlightScores } from "./types";
import { PERSONALITY_SYSTEM_PROMPT, buildPersonalityUserPrompt } from "./prompt";

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

export async function generateReportWithLLM(input: {
  name: string;
  scores: DimensionScores;
  answers: string;
}): Promise<{ report: PersonalityReport; provider: EngineProvider } | null> {
  const config = clientConfig();
  if (!config) return null;

  const { client, provider, model } = config;

  try {
    const completion = await client.chat.completions.create(
      {
        model,
        temperature: 0.7,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PERSONALITY_SYSTEM_PROMPT },
          { role: "user", content: buildPersonalityUserPrompt(input) },
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
    const report = mergeReport(input.name, input.scores, parsed as Partial<PersonalityReport>);
    return { report: normalizeHighlightScores(report), provider };
  } catch (error) {
    const status = (error as { status?: number })?.status;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`LLM personality report failed (${provider}, ${status ?? "unknown status"}): ${message}`);
    return null;
  }
}