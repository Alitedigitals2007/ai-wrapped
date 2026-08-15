import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mergeAnalysis, type Analysis } from "@/lib/analysis/types";
import { AI_EMOJI } from "@/lib/analysis/prompt";
import { APP_NAME, WRAPPED_FEATURE_NAME } from "@/lib/brand";
import WrappedViewer from "@/components/wrapped/wrapped-viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { username: true, aiUsed: true },
    });
    if (!submission) return { title: `${WRAPPED_FEATURE_NAME} Not Found` };
    return {
      title: `${submission.username}'s ${WRAPPED_FEATURE_NAME}`,
      description: `Discover how AI sees ${submission.username} — a ${WRAPPED_FEATURE_NAME} powered by ${submission.aiUsed}.`,
    };
  } catch {
    return { title: APP_NAME };
  }
}

export default async function WrappedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let submission;
  try {
    submission = await prisma.submission.findUnique({ where: { id } });
  } catch {
    notFound();
  }
  if (!submission) notFound();

  const analysis = mergeAnalysis(submission.analysisJson as Partial<Analysis>);

  return (
    <WrappedViewer
      id={submission.id}
      code={submission.code ?? null}
      username={submission.username}
      aiUsed={submission.aiUsed}
      aiEmoji={AI_EMOJI[submission.aiUsed] ?? "🤖"}
      analysis={analysis}
    />
  );
}
