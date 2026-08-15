import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminQuizDetail from "@/components/quiz/admin-quiz-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Quiz Detail — Aura Admin" };

export default async function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let quiz;
  try {
    quiz = await prisma.friendQuiz.findUnique({
      where: { id },
      include: { attempts: { orderBy: { score: "desc" } } },
    });
  } catch {
    notFound();
  }
  if (!quiz) notFound();

  const questions = (quiz.questionsJson ?? []) as unknown as {
    text: string;
    options: string[];
    correctIndex: number;
  }[];

  return (
    <AdminQuizDetail
      creatorName={quiz.creatorName}
      title={quiz.title}
      code={quiz.code}
      createdAt={quiz.createdAt.toISOString()}
      questions={questions}
      attempts={quiz.attempts.map((a) => ({
        id: a.id,
        playerName: a.playerName,
        score: a.score,
        total: a.total,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}