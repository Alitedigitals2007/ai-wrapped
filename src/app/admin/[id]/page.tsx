"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Analysis } from "@/lib/analysis/types";
import { AI_EMOJI } from "@/lib/analysis/prompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  username: string;
  aiUsed: string;
  createdAt: string;
  prompt: string;
  response: string;
  analysis: Analysis;
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-3xl p-6", className)}>
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-sm leading-snug">{value || "—"}</div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/submissions/${params.id}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load submission");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex-1 min-h-screen grid place-items-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex-1 min-h-screen grid place-items-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error ?? "Submission not found"}</p>
          <Link href="/admin">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </main>
    );
  }

  const a = data.analysis;

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-8 pb-16">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-violet-400/30 dark:bg-violet-600/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 flex flex-wrap items-center gap-4">
          <div className="size-14 grid place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl">
            {AI_EMOJI[data.aiUsed] ?? "🤖"}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight truncate">
              {data.username}
            </h1>
            <p className="text-sm text-muted-foreground">
              {data.aiUsed} · {fmtDate(data.createdAt)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Overall Score</div>
            <div className="font-display text-4xl font-bold text-gradient">{a.scores.overall}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {a.profile.engine === "groq"
                ? "⚡ Groq"
                : a.profile.engine === "openai"
                  ? "✦ OpenAI"
                  : "⚙️ Local analysis"}
            </div>
          </div>
        </div>

        <Section title="🧬 Basic Information">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Username" value={data.username} />
            <KV label="AI Used" value={data.aiUsed} />
            <KV label="Date Generated" value={fmtDate(data.createdAt)} />
            <KV label="Wrapped ID" value={data.id} />
          </div>
        </Section>

        <Section title="🧠 Personality">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Personality Type" value={a.personality.personalityType} />
            <KV label="AI Archetype" value={a.personality.aiArchetype} />
            <KV label="Communication Style" value={a.personality.communicationStyle} />
            <KV label="Thinking Style" value={a.personality.thinkingStyle} />
            <KV label="Learning Style" value={a.personality.learningStyle} />
            <KV label="Decision Style" value={a.personality.decisionStyle} />
            <KV label="Leadership Style" value={a.personality.leadershipStyle} />
            <KV label="Confidence Level" value={a.personality.confidenceLevel} />
            <KV label="Curiosity Level" value={a.personality.curiosityLevel} />
            <KV label="Creativity Level" value={a.personality.creativityLevel} />
          </div>
        </Section>

        <Section title="📊 Scores">
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(a.scores).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-black/10 bg-black/[0.03] p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="font-bold tabular-nums">{value}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-black/10 overflow-hidden dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="🗣️ Language">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Most Used Word" value={`"${a.language.mostUsedWord}"`} />
            <KV label="Most Used Phrase" value={`"${a.language.mostUsedPhrase}"`} />
            <KV label="Vocabulary Level" value={a.language.vocabularyLevel} />
            <KV label="Writing Style" value={a.language.writingStyle} />
            <KV label="Prompt Style" value={a.language.promptStyle} />
            <KV label="Question Style" value={a.language.questionStyle} />
            <KV label="Average Complexity" value={a.language.averageComplexity} />
          </div>
        </Section>

        <Section title="📚 Topics & Interests">
          <div className="flex flex-wrap gap-2 mb-4">
            {a.interests.topTopics.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Favorite Domain" value={a.interests.favoriteDomain} />
            <KV label="Most Discussed Area" value={a.interests.mostDiscussedArea} />
            <KV label="Top Subjects" value={a.interests.topSubjects.join(", ")} />
          </div>
        </Section>

        <Section title="💼 Productivity">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Estimated Hours Saved" value={a.productivity.estimatedHoursSaved} />
            <KV label="Most Common Use" value={a.productivity.mostCommonUse} />
            <KV label="Research Level" value={a.productivity.researchLevel} />
            <KV label="Writing Level" value={a.productivity.writingLevel} />
            <KV label="Coding Level" value={a.productivity.codingLevel} />
          </div>
        </Section>

        <Section title="💪 Strengths">
          <div className="flex flex-wrap gap-2">
            {a.strengths.map((s) => (
              <Badge key={s} className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">{s}</Badge>
            ))}
          </div>
        </Section>

        <Section title="🌱 Growth Areas">
          <div className="flex flex-wrap gap-2">
            {a.improvement.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </Section>

        <Section title="🚀 Career Matches">
          <div className="grid gap-3 sm:grid-cols-3">
            <KV label="Top Match" value={a.career.topMatch} />
            <KV label="Second Match" value={a.career.secondMatch} />
            <KV label="Third Match" value={a.career.thirdMatch} />
          </div>
        </Section>

        <Section title="🏆 Achievements">
          <div className="flex flex-wrap gap-2">
            {a.achievements.map((badge) => (
              <Badge key={badge} className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20">🏅 {badge}</Badge>
            ))}
          </div>
        </Section>

        <Section title="🔮 Predictions">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Next Skill" value={a.prediction.nextSkill} />
            <KV label="Next Challenge" value={a.prediction.nextChallenge} />
            <KV label="Book Recommendation" value={a.prediction.bookRecommendation} />
            <KV label="Project Recommendation" value={a.prediction.projectRecommendation} />
            <KV label="Learning Recommendation" value={a.prediction.learningRecommendation} />
          </div>
        </Section>

        <Section title="😂 Fun Insights">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Signature Prompt" value={a.fun.signaturePrompt} />
            <KV label="Most Unexpected Prompt" value={a.fun.mostUnexpectedPrompt} />
            <KV label="Biggest Rabbit Hole" value={a.fun.biggestRabbitHole} />
            <KV label="Wildest Question" value={a.fun.wildestQuestion} />
            <KV label="Most Creative Moment" value={a.fun.mostCreativeMoment} />
            <KV label="Funniest Insight" value={a.fun.funniestInsight} />
          </div>
        </Section>

        <Section title="📜 Original Data">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Original Prompt
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                {data.prompt}
              </p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                AI Response
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-80 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                {data.response}
              </p>
            </div>
          </div>
        </Section>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button render={<Link href="/admin" />}>Back to Dashboard</Button>
        </div>
      </div>
    </main>
  );
}
