import { scoreAssessment, answersForPrompt, getOpenAnswers, personalityLabel, type Answers } from "./score";
import { generateReportWithLLM } from "./llm";
import type { PersonalityReport } from "./types";
import { buildDefaultReport, mergeReport, normalizeHighlightScores } from "./types";

export type ReportEngine = "groq" | "openai" | "local";

export interface AssessmentResult {
  report: PersonalityReport;
  scores: ReturnType<typeof scoreAssessment>["scores"];
  answeredMcq: number;
  engine: ReportEngine;
  label: string;
}

export async function assessPersonality(input: {
  name: string;
  answers: Answers;
}): Promise<AssessmentResult> {
  const { scores, answeredMcq } = scoreAssessment(input.answers);
  const promptText = answersForPrompt(input.answers);
  const openAnswers = getOpenAnswers(input.answers);
  const label = personalityLabel(scores);

  const llmResult = await generateReportWithLLM({
    name: input.name,
    scores,
    answers: promptText,
  });

  let report: PersonalityReport;
  let engine: ReportEngine = "local";

  if (llmResult) {
    report = llmResult.report;
    engine = llmResult.provider;
  } else {
    const base = buildDefaultReport(input.name, scores);
    const custom = Object.values(openAnswers)
      .map((s) => s.trim())
      .filter(Boolean);
    const strengths = Array.from(
      new Set([...(custom.length ? [custom[0]] : []), ...base.strengths])
    ).slice(0, 6);
    report = mergeReport(input.name, scores, {
      ...base,
      strengths,
      profile: { ...base.profile, engine: "local" as const },
    });
    report = normalizeHighlightScores(report);
  }

  // Always reflect the label + engine on the profile.
  report.profile.label = label;
  if (!llmResult) report.profile.engine = engine;

  return { report, scores, answeredMcq, engine, label };
}