import { analyzeWithLLM } from "./llm";
import { analyzeLocally } from "./fallback";
import type { Analysis } from "./types";
import { mergeAnalysis } from "./types";

export async function analyzeResponse(input: {
  username: string;
  aiUsed: string;
  text: string;
}): Promise<{ analysis: Analysis; engine: "cerebras" | "openai" | "local" }> {
  const llmResult = await analyzeWithLLM(input);
  if (llmResult) {
    return {
      analysis: mergeAnalysis(llmResult),
      engine: process.env.CEREBRAS_API_KEY ? "cerebras" : "openai",
    };
  }
  return { analysis: analyzeLocally(input), engine: "local" };
}
