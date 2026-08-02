import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: submission.id,
      username: submission.username,
      aiUsed: submission.aiUsed,
      createdAt: submission.createdAt.toISOString(),
      prompt: submission.prompt,
      response: submission.response,
      analysis: submission.analysisJson,
      wrapped: submission.wrappedJson,
    });
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      { error: "Could not load submission." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.submission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete submission error:", error);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
