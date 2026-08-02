import { analyzeWithLLM } from "./llm";
import { analyzeLocally } from "./fallback";
import type { Analysis } from "./types";

export type AnalysisEngine = "groq" | "openai" | "local";

export async function analyzeResponse(input: {
  username: string;
  aiUsed: string;
  text: string;
}): Promise<{ analysis: Analysis; engine: AnalysisEngine }> {
  const llmResult = await analyzeWithLLM(input);
  if (llmResult) {
    return {
      analysis: {
        ...llmResult.analysis,
        profile: { ...llmResult.analysis.profile, engine: llmResult.provider },
      },
      engine: llmResult.provider,
    };
  }
  const local = analyzeLocally(input);
  return {
    analysis: {
      ...local,
      profile: { ...local.profile, engine: "local" },
    },
    engine: "local",
  };
}