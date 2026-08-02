import OpenAI from "openai";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "./prompt";
import type { Analysis } from "./types";
import { mergeAnalysis } from "./types";

function clientFor(): OpenAI | null {
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  if (cerebrasKey) {
    return new OpenAI({ apiKey: cerebrasKey, baseURL: "https://api.cerebras.ai/v1" });
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return new OpenAI({ apiKey: openaiKey });
  }
  return null;
}

export async function analyzeWithLLM(input: {
  username: string;
  aiUsed: string;
  text: string;
}): Promise<Analysis | null> {
  const client = clientFor();
  if (!client) return null;

  const model =
    process.env.CEREBRAS_MODEL ||
    process.env.OPENAI_MODEL ||
    "llama-3.3-70b";

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
    return mergeAnalysis(withProfile as Partial<Analysis>);
  } catch (error) {
    console.error("LLM analysis failed:", error);
    return null;
  }
}
