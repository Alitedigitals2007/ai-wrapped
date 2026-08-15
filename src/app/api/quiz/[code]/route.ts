import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export const maxDuration = 30;

const attemptSchema = z.object({
  playerName: z.string().trim().min(1, "Enter your name").max(40),
  answers: z.array(z.number().int().min(0)).min(1).max(12),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const quiz = await prisma.friendQuiz.findUnique({
    where: { code: code.toUpperCase() },
    include: { attempts: { orderBy: { score: "desc" }, take: 50 } },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const questions = (quiz.questionsJson ?? []) as unknown as {
    text: string;
    options: string[];
  }[];

  return NextResponse.json({
    id: quiz.id,
    creatorName: quiz.creatorName,
    title: quiz.title,
    code: quiz.code,
    createdAt: quiz.createdAt.toISOString(),
    // Never leak correctIndex here — only text + options for the player.
    questions: questions.map((q) => ({ text: q.text, options: q.options })),
    leaderboard: quiz.attempts.map((a) => ({
      playerName: a.playerName,
      score: a.score,
      total: a.total,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 422 }
    );
  }

  const { playerName, answers } = parsed.data;

  const quiz = await prisma.friendQuiz.findUnique({ where: { code: code.toUpperCase() } });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const questions = (quiz.questionsJson ?? []) as unknown as { correctIndex: number }[];
  if (answers.length !== questions.length) {
    return NextResponse.json(
      { error: "Answer every question before submitting." },
      { status: 422 }
    );
  }

  let score = 0;
  const results = answers.map((a, i) => {
    const correct = questions[i]?.correctIndex === a;
    if (correct) score += 1;
    return { correct, correctIndex: questions[i]?.correctIndex ?? 0 };
  });

  let attempt;
  try {
    attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        playerName,
        answersJson: answers as unknown as object,
        score,
        total: questions.length,
      },
    });
  } catch (dbError) {
    console.error("Failed to save attempt:", dbError);
    return NextResponse.json(
      { error: "Could not save your score. Check DATABASE_URL." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    id: attempt.id,
    score,
    total: questions.length,
    results,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.friendQuiz.delete({ where: { code: code.toUpperCase() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}