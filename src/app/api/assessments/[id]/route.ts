import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { QUESTIONS } from "@/lib/personality/questions";
import type { PersonalityReport } from "@/lib/personality/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const answersJson = (assessment.answersJson ?? {}) as unknown as Record<string, string>;
    const report = (assessment.reportJson ?? {}) as unknown as PersonalityReport;

    const answers = QUESTIONS.map((q) => {
      const val = answersJson[q.id]?.trim();
      if (!val) return null;
      if (q.type === "mcq") {
        const opt = q.options.find((o) => o.key === val);
        return {
          qid: q.id,
          section: q.section,
          text: q.text,
          type: "mcq" as const,
          answer: opt ? `${opt.key}. ${opt.label}` : val,
        };
      }
      return { qid: q.id, section: q.section, text: q.text, type: "open" as const, answer: val };
    });

    return NextResponse.json({
      id: assessment.id,
      name: assessment.name,
      code: assessment.code,
      engine: assessment.engine,
      createdAt: assessment.createdAt.toISOString(),
      report,
      scores: assessment.scoresJson,
      answers,
    });
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.assessment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete assessment error:", error);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}