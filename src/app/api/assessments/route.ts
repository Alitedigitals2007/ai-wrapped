import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assessPersonality } from "@/lib/personality/analyze";
import { getQuestion, QUESTIONS } from "@/lib/personality/questions";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { generateCode } from "@/lib/code";

export const maxDuration = 60;

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(40, "Name must be 40 characters or less"),
  answers: z
    .record(z.string(), z.string().max(500, "An answer is too long"))
    .refine((v) => Object.values(v).some((x) => x.trim().length > 0), {
      message: "Answer at least one question",
    }),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
      };
    }

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      take: 500,
    });

    const rows = assessments.map((a) => {
      const report = (a.reportJson ?? {}) as unknown as {
        archetype?: string;
        profile?: { label?: string; engine?: string };
      };
      const scores = (a.scoresJson ?? {}) as Record<string, number>;
      const overall =
        scores &&
        typeof scores === "object" &&
        Object.values(scores).length
          ? Math.round(
              Object.values(scores).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0) /
                Math.max(1, Object.values(scores).length)
            )
          : 0;
      return {
        id: a.id,
        name: a.name,
        createdAt: a.createdAt.toISOString(),
        code: a.code,
        engine: report.profile?.engine ?? null,
        label: report.profile?.label ?? "",
        archetype: report.archetype ?? "",
        overallScore: overall,
      };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("List assessments error:", error);
    return NextResponse.json(
      { error: "Could not load personality tests. Check DATABASE_URL." },
      { status: 500 }
    );
  }
}

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

  const { name, answers } = parsed.data;

  // Validate question ids exist.
  for (const qid of Object.keys(answers)) {
    if (!getQuestion(qid)) {
      return NextResponse.json({ error: `Unknown question: ${qid}` }, { status: 422 });
    }
  }

  try {
    const { report, scores, engine, label } = await assessPersonality({ name, answers });

    let assessment;
    try {
      assessment = await prisma.assessment.create({
        data: {
          name,
          answersJson: answers as unknown as object,
          scoresJson: scores as unknown as object,
          reportJson: { ...report, profile: { ...report.profile, engine } } as unknown as object,
          code: generateCode(),
          engine,
        },
      });
    } catch (dbError) {
      console.error("Failed to save assessment:", dbError);
      return NextResponse.json(
        { error: "Analysis complete, but saving to the database failed. Check DATABASE_URL." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      id: assessment.id,
      url: `/report/${assessment.code}`,
      code: assessment.code,
      engine,
      label,
      answeredMcq: QUESTIONS.filter((q) => q.type === "mcq" && answers[q.id]).length,
    });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json(
      { error: "Something went wrong while building your report. Please try again." },
      { status: 500 }
    );
  }
}