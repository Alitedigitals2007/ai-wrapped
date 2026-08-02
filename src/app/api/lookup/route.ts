import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code || code.length < 4 || code.length > 16) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  try {
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
    if (!submission) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: submission.id,
      username: submission.username,
      aiUsed: submission.aiUsed,
      code: submission.code,
      analysis: submission.analysisJson,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}