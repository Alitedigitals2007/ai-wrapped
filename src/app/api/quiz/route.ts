import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/code";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export const maxDuration = 30;

const questionSchema = z.object({
  text: z.string().trim().min(1).max(120),
  options: z.array(z.string().trim().min(1).max(60)).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

const createSchema = z.object({
  creatorName: z.string().trim().min(1, "Your name is required").max(40),
  title: z.string().trim().max(60).optional(),
  questions: z.array(questionSchema).min(1, "Add at least one question").max(12),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 422 }
    );
  }

  const { creatorName, title, questions } = parsed.data;

  let quiz;
  try {
    quiz = await prisma.friendQuiz.create({
      data: {
        creatorName,
        title: title?.trim() || "Who knows me best?",
        questionsJson: questions as unknown as object,
        code: generateCode(),
      },
    });
  } catch (dbError) {
    console.error("Failed to create quiz:", dbError);
    return NextResponse.json(
      { error: "Could not save your quiz. Check DATABASE_URL." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    id: quiz.id,
    url: `/quiz/${quiz.code}`,
    code: quiz.code,
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

  try {
    const quizzes = await prisma.friendQuiz.findMany({
      where: search
        ? {
            OR: [
              { creatorName: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { attempts: true } } },
    });

    const rows = quizzes.map((q) => ({
      id: q.id,
      creatorName: q.creatorName,
      title: q.title,
      code: q.code,
      createdAt: q.createdAt.toISOString(),
      questionCount: (q.questionsJson as unknown[] | null)?.length ?? 0,
      attempts: q._count.attempts,
    }));

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("List quizzes error:", error);
    return NextResponse.json({ error: "Could not load quizzes" }, { status: 500 });
  }
}