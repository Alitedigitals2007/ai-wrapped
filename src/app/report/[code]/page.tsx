import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mergeReport, type PersonalityReport } from "@/lib/personality/types";
import { DIMENSION_META, type Dimension, type DimensionScores } from "@/lib/personality/dimensions";
import ReportViewer from "@/components/personality/report-viewer";

export const dynamic = "force-dynamic";

function normalizeReport(raw: PersonalityReport, name: string, scores: DimensionScores) {
  // Ensure every dimension key exists for the cards.
  const merged = mergeReport(name, scores, raw);
  for (const m of DIMENSION_META) {
    if (typeof merged.dimensions[m.key] !== "number") {
      merged.dimensions[m.key] = 50;
    }
  }
  merged.highlights = DIMENSION_META.map((m) => {
    const existing = (merged.highlights ?? []).find((h) => h.key === m.key);
    return {
      key: m.key as Dimension,
      label: m.label,
      emoji: m.emoji,
      score: merged.dimensions[m.key] ?? 50,
      description: existing?.description ?? m.blurb,
    };
  }).sort((a, b) => b.score - a.score);
  return merged;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { code: code.toUpperCase() },
      select: { name: true, reportJson: true, scoresJson: true },
    });
    if (!assessment) return { title: "Report Not Found" };
    const report = (assessment.reportJson ?? {}) as unknown as PersonalityReport;
    return {
      title: `${assessment.name}'s Personality Report`,
      description:
        report.tagline ||
        `Personality report for ${assessment.name} — 15 dimensions, AI-written insights.`,
    };
  } catch {
    return { title: "Personality Report" };
  }
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let assessment;
  try {
    assessment = await prisma.assessment.findUnique({
      where: { code: code.toUpperCase() },
    });
  } catch {
    notFound();
  }
  if (!assessment) notFound();

  const scores = (assessment.scoresJson ?? {}) as DimensionScores;
  for (const m of DIMENSION_META) {
    if (typeof scores[m.key] !== "number") scores[m.key] = 50;
  }
  const raw = (assessment.reportJson ?? {}) as unknown as PersonalityReport;
  const report = normalizeReport(raw, assessment.name, scores);

  return (
    <ReportViewer
      code={assessment.code ?? null}
      name={assessment.name}
      report={report}
      engine={assessment.engine ?? null}
    />
  );
}