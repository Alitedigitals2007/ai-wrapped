import { buildScores, levelOf, DIMENSION_META, type DimensionScores } from "./dimensions";
import { QUESTIONS, type OptionWeight } from "./questions";

export interface Answers {
  [questionId: string]: string; // "A"/"B"/... or "free text" for open
}

export interface ScoredAssessment {
  scores: DimensionScores;
  answeredMcq: number;
}

export function scoreAssessment(answers: Answers): ScoredAssessment {
  const weights: OptionWeight[] = [];
  let answered = 0;

  for (const q of QUESTIONS) {
    if (q.type !== "mcq") continue;
    const val = answers[q.id];
    if (!val) continue;
    const opt = q.options.find((o) => o.key === val);
    if (opt) {
      weights.push(opt.weights);
      answered++;
    }
  }

  return { scores: buildScores(weights), answeredMcq: answered };
}

export interface TopDimension {
  key: (typeof DIMENSION_META)[number]["key"];
  label: string;
  emoji: string;
  score: number;
  level: string;
}

export function rankDimensions(scores: DimensionScores): TopDimension[] {
  return DIMENSION_META.map((m) => ({
    key: m.key,
    label: m.label,
    emoji: m.emoji,
    score: scores[m.key],
    level: levelOf(scores[m.key]),
  })).sort((a, b) => b.score - a.score);
}

export function dominantTraits(scores: DimensionScores, count = 5): TopDimension[] {
  return rankDimensions(scores).slice(0, count).filter((d) => d.score >= 55);
}

export function personalityLabel(scores: DimensionScores): string {
  const top = rankDimensions(scores);
  const high = top.filter((d) => d.score >= 65).map((d) => d.label);
  const low = [...top].reverse().filter((d) => d.score <= 40).map((d) => d.label);

  const middle = high.slice(0, 2).join(" & ") || "Balanced";
  const contrast = low[0] ? `, low ${low[0].toLowerCase()}` : "";
  return `${middle}${contrast}`;
}

export function answersForPrompt(answers: Answers): string {
  const lines: string[] = [];
  for (const q of QUESTIONS) {
    const val = answers[q.id]?.trim();
    if (!val) continue;
    if (q.type === "mcq") {
      const opt = q.options.find((o) => o.key === val);
      lines.push(`Q (${q.section}): ${q.text}\n  → ${opt ? `${opt.key}. ${opt.label}` : val}`);
    } else {
      lines.push(`Q (${q.section}): ${q.text}\n  → ${val}`);
    }
  }
  return lines.join("\n\n");
}

export function getOpenAnswers(answers: Answers): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of QUESTIONS) {
    if (q.type !== "open") continue;
    const v = answers[q.id]?.trim();
    if (v) out[q.text] = v;
  }
  return out;
}