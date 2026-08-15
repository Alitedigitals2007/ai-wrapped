import { DIMENSION_META, type DimensionScores, type Dimension } from "./dimensions";

export interface PersonalityReport {
  profile: {
    name: string;
    generatedDate: string;
    engine?: "groq" | "openai" | "local";
    label?: string;
  };
  archetype: string;
  tagline: string;
  summary: string;
  dimensions: DimensionScores;
  highlights: { key: Dimension; label: string; emoji: string; score: number; description: string }[];
  strengths: string[];
  growthAreas: string[];
  blindSpot: string;
  styles: {
    social: string;
    decision: string;
    conflict: string;
    values: string;
  };
  careers: string[];
  funFact: string;
}

export const DEFAULT_RESULTS =
  "Moderate Extraversion with balanced openness. Prefers planning but stays flexible. Values independence and fairness, communicates directly in conflict. More comfortable observing first in new groups.";

export function buildDefaultReport(name: string, scores: DimensionScores): PersonalityReport {
  const highlights = DIMENSION_META.map((m) => ({
    key: m.key,
    label: m.label,
    emoji: m.emoji,
    score: scores[m.key],
    description: `${m.label}: ${m.blurb}. Score reflects your pattern of choices.`,
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    profile: {
      name,
      generatedDate: new Date().toISOString(),
    },
    archetype: "The Balanced Observer",
    tagline: "A thoughtful, self-aware personality that adapts to context.",
    summary: DEFAULT_RESULTS,
    dimensions: scores,
    highlights,
    strengths: ["Adaptability", "Independence", "Fairness", "Pattern awareness"],
    growthAreas: ["Consistency", "Pacing under pressure"],
    blindSpot:
      "You may sometimes prioritize solving a problem over addressing the emotional side of the situation.",
    styles: {
      social: "Comfortable engaging deeply when there's a reason to, but not constantly seeking stimulation.",
      decision: "Independent and analytical.",
      conflict: "Direct but solution-oriented.",
      values: "Independence, fairness and doing the right thing.",
    },
    careers: ["Product Designer", "Strategic Consultant", "Project Lead"],
    funFact:
      "Your answers reveal a profile that balances structure and flexibility — a rare mix.",
  };
}

export function mergeReport(
  name: string,
  scores: DimensionScores,
  raw: Partial<PersonalityReport>
): PersonalityReport {
  const base = buildDefaultReport(name, scores);
  return {
    ...base,
    ...raw,
    profile: {
      ...base.profile,
      ...(raw.profile ?? {}),
      name,
      generatedDate: new Date().toISOString(),
    },
    dimensions: scores,
    highlights: Array.isArray(raw.highlights) && raw.highlights.length ? raw.highlights : base.highlights,
    strengths: Array.isArray(raw.strengths) && raw.strengths.length ? raw.strengths.slice(0, 8) : base.strengths,
    growthAreas: Array.isArray(raw.growthAreas) && raw.growthAreas.length ? raw.growthAreas.slice(0, 5) : base.growthAreas,
    careers: Array.isArray(raw.careers) && raw.careers.length ? raw.careers.slice(0, 8) : base.careers,
  };
}

export function normalizeHighlightScores(report: PersonalityReport): PersonalityReport {
  report.highlights = (report.highlights || []).map((h) => ({
    ...h,
    score: typeof h.score === "number" && Number.isFinite(h.score) ? Math.max(0, Math.min(100, Math.round(h.score))) : 50,
  }));
  return report;
}