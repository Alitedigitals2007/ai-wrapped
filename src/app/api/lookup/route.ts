import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DIMENSION_META, type DimensionScores } from "@/lib/personality/dimensions";

export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code || code.length < 4 || code.length > 16) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  try {
    // Look up a Wrapped submission first.
    const submission = await prisma.submission.findUnique({
      where: { code },
      select: {
        id: true,
        username: true,
        aiUsed: true,
        code: true,
        analysisJson: true,
      },
    });
    if (submission) {
      return NextResponse.json({
        type: "wrapped",
        id: submission.id,
        username: submission.username,
        aiUsed: submission.aiUsed,
        code: submission.code,
        analysis: submission.analysisJson,
      });
    }

    // Otherwise look up a personality report.
    const assessment = await prisma.assessment.findUnique({
      where: { code },
      select: {
        id: true,
        name: true,
        code: true,
        reportJson: true,
        scoresJson: true,
      },
    });
    if (assessment) {
      const scores = (assessment.scoresJson ?? {}) as DimensionScores;
      for (const m of DIMENSION_META) {
        if (typeof scores[m.key] !== "number") scores[m.key] = 50;
      }
      return NextResponse.json({
        type: "report",
        id: assessment.id,
        name: assessment.name,
        code: assessment.code,
        report: assessment.reportJson,
        scores,
      });
    }

    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}