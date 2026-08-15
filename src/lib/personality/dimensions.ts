export const DIMENSIONS = [
  "extraversion",
  "openness",
  "conscientiousness",
  "agreeableness",
  "emotionalStability",
  "assertiveness",
  "riskTolerance",
  "independence",
  "empathy",
  "resilience",
  "ambition",
  "adaptability",
  "trustOrientation",
  "conflictDirectness",
  "selfAwareness",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type DimensionScores = Record<Dimension, number>;

export const DIMENSION_META: { key: Dimension; label: string; emoji: string; blurb: string }[] = [
  { key: "extraversion", label: "Extraversion", emoji: "🎉", blurb: "Energy from people vs. solitude" },
  { key: "openness", label: "Openness", emoji: "🌍", blurb: "Appetite for new ideas & experiences" },
  { key: "conscientiousness", label: "Conscientiousness", emoji: "🎯", blurb: "Order, planning & follow-through" },
  { key: "agreeableness", label: "Agreeableness", emoji: "🤝", blurb: "Warmth & concern for others" },
  { key: "emotionalStability", label: "Emotional Stability", emoji: "🧘", blurb: "Calm under pressure & setbacks" },
  { key: "assertiveness", label: "Assertiveness", emoji: "🗣️", blurb: "Speaking up & standing firm" },
  { key: "riskTolerance", label: "Risk Tolerance", emoji: "🎢", blurb: "Comfort with uncertainty & stakes" },
  { key: "independence", label: "Independence", emoji: "🧭", blurb: "Self-reliance in decisions" },
  { key: "empathy", label: "Empathy", emoji: "💛", blurb: "Tuning into others' feelings" },
  { key: "resilience", label: "Resilience", emoji: "🌱", blurb: "Bouncing back from failure" },
  { key: "ambition", label: "Ambition", emoji: "🚀", blurb: "Drive for achievement & growth" },
  { key: "adaptability", label: "Adaptability", emoji: "🌀", blurb: "Flexibility when plans change" },
  { key: "trustOrientation", label: "Trust Orientation", emoji: "🔐", blurb: "Trusting others by default" },
  { key: "conflictDirectness", label: "Conflict Directness", emoji: "⚔️", blurb: "Facing disagreement head-on" },
  { key: "selfAwareness", label: "Self-Awareness", emoji: "🔍", blurb: "Understanding your own patterns" },
];

export function buildScores(weights: Partial<Record<Dimension, number>>[]): DimensionScores {
  const sums: Partial<Record<Dimension, number>> = {};
  const counts: Partial<Record<Dimension, number>> = {};
  for (const w of weights) {
    for (const [dim, val] of Object.entries(w) as [Dimension, number][]) {
      sums[dim] = (sums[dim] ?? 0) + val;
      counts[dim] = (counts[dim] ?? 0) + 1;
    }
  }
  const out = {} as DimensionScores;
  for (const d of DIMENSIONS) {
    const count = counts[d] ?? 0;
    out[d] = count ? Math.max(3, Math.min(97, Math.round((sums[d] ?? 0) / count))) : 50;
  }
  return out;
}

export function levelOf(score: number): string {
  if (score >= 75) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}