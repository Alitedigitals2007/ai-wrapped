import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { analyzeResponse } from "@/lib/analysis/analyze";
import { buildSummary } from "@/lib/analysis/types";
import { ENGINEERED_PROMPT } from "@/lib/analysis/prompt";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

const AI_VALUES = [
  "ChatGPT", "Gemini", "Claude", "Grok", "DeepSeek", "Perplexity",
  "Microsoft Copilot", "Meta AI", "Qwen", "Kimi", "Mistral AI", "Other",
] as const;

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(30, "Username must be 30 characters or less"),
  aiUsed: z.enum(AI_VALUES, { errorMap: () => ({ message: "Please choose an AI" }) }),
  response: z
    .string()
    .trim()
    .min(100, "Paste a longer response (at least 100 characters)")
    .max(40000, "Response is too long (40,000 character limit)"),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const ai = searchParams.get("ai")?.trim() ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  try {
    const where: Record<string, unknown> = {};
    if (search) {
      where.username = { contains: search, mode: "insensitive" };
    }
    if (ai) {
      where.aiUsed = ai;
    }
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
      };
    }

    const submissions = await prisma.submission.findMany({
      where,
      orderBy:
        sort === "score" ? undefined : { createdAt: sort === "oldest" ? "asc" : "desc" },
      take: 500,
    });

    const rows = submissions
      .map((s) => ({
        id: s.id,
        username: s.username,
        aiUsed: s.aiUsed,
        createdAt: s.createdAt.toISOString(),
        overallScore:
          (s.analysisJson as { scores?: { overall?: number } }).scores?.overall ?? 0,
        personalityType:
          (s.analysisJson as { personality?: { personalityType?: string } }).personality
            ?.personalityType ?? "",
      }))
      .sort(
        sort === "score"
          ? (a, b) => b.overallScore - a.overallScore || a.username.localeCompare(b.username)
          : (a, b) =>
              sort === "oldest"
                ? a.createdAt.localeCompare(b.createdAt)
                : b.createdAt.localeCompare(a.createdAt)
      );

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("List submissions error:", error);
    return NextResponse.json(
      { error: "Could not load submissions. Check DATABASE_URL." },
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

  const { username, aiUsed, response } = parsed.data;

  try {
    const { analysis, engine } = await analyzeResponse({
      username,
      aiUsed,
      text: response,
    });

    const wrapped = buildSummary(analysis);

    let submission;
    try {
      submission = await prisma.submission.create({
        data: {
          username,
          aiUsed,
          prompt: ENGINEERED_PROMPT,
          response,
          analysisJson: analysis as unknown as object,
          wrappedJson: wrapped as unknown as object,
        },
      });
    } catch (dbError) {
      console.error("Failed to save submission:", dbError);
      return NextResponse.json(
        { error: "Analysis complete, but saving to the database failed. Check DATABASE_URL." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      id: submission.id,
      url: `/wrapped/${submission.id}`,
      engine,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong while analyzing. Please try again." },
      { status: 500 }
    );
  }
}
