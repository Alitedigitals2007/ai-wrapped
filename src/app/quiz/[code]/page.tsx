import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizPlayClient from "@/components/quiz/quiz-play";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  try {
    const quiz = await prisma.friendQuiz.findUnique({
      where: { code: code.toUpperCase() },
      select: { creatorName: true, title: true },
    });
    if (!quiz) return { title: "Quiz Not Found" };
    return {
      title: `${quiz.title} — by ${quiz.creatorName}`,
      description: `Take ${quiz.creatorName}'s quiz and find out if you know them best.`,
    };
  } catch {
    return { title: "Quiz" };
  }
}

export default async function QuizPlayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let quiz;
  try {
    quiz = await prisma.friendQuiz.findUnique({ where: { code: code.toUpperCase() } });
  } catch {
    notFound();
  }
  if (!quiz) notFound();

  const questions = (quiz.questionsJson ?? []) as unknown as {
    text: string;
    options: string[];
  }[];

  return (
    <QuizPlayClient
      code={quiz.code}
      creatorName={quiz.creatorName}
      title={quiz.title}
      questions={questions.map((q) => ({ text: q.text, options: q.options }))}
    />
  );
}