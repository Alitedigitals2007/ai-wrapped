"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { PersonalityReport } from "@/lib/personality/types";
import type { DimensionScores } from "@/lib/personality/dimensions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerRow {
  qid: string;
  section: string;
  text: string;
  type: "mcq" | "open";
  answer: string;
}

interface TestDetail {
  id: string;
  name: string;
  code: string | null;
  engine: string | null;
  createdAt: string;
  report: PersonalityReport;
  scores: DimensionScores;
  answers: (AnswerRow | null)[];
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

export default function AdminTestDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<TestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/assessments/${params.id}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
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
          <p className="text-muted-foreground">{error ?? "Test not found"}</p>
          <Link href="/admin">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </main>
    );
  }

  const r = data.report;
  const scores = data.scores ?? ({} as DimensionScores);

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-8 pb-16">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-teal-400/30 dark:bg-teal-600/15 blur-[120px]" />
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
          <div className="size-14 grid place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-2xl">
            🧠
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight truncate">
              {data.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {r.archetype} · {fmtDate(data.createdAt)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Report Code</div>
            <div className="font-display text-2xl font-bold text-gradient tracking-[0.15em]">
              {data.code ?? "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {data.engine === "groq" ? "⚡ Groq" : data.engine === "openai" ? "✦ OpenAI" : "⚙️ Local analysis"}
            </div>
          </div>
        </div>

        <Section title="🧠 Report">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Archetype" value={r.archetype} />
            <KV label="Profile Label" value={r.profile.label ?? "—"} />
            <KV label="Tagline" value={r.tagline} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground italic">
            <span className="not-italic font-semibold text-foreground">Blind spot: </span>
            {r.blindSpot}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Fun fact: </span>
            {r.funFact}
          </p>
        </Section>

        <Section title="📊 Dimension Scores">
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(scores)
              .filter(([, v]) => typeof v === "number")
              .map(([key, value]) => (
                <div key={key} className="rounded-xl border border-black/10 bg-black/[0.03] p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-bold tabular-nums">{value as number}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-black/10 overflow-hidden dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Section>

        <Section title="💪 Strengths & Growth">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Strengths</div>
              <div className="flex flex-wrap gap-2">
                {r.strengths.map((s) => (
                  <span key={s} className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Growth Areas</div>
              <div className="flex flex-wrap gap-2">
                {r.growthAreas.map((s) => (
                  <span key={s} className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-muted-foreground dark:bg-white/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="🎨 Styles">
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Social Energy" value={r.styles.social} />
            <KV label="Decision Style" value={r.styles.decision} />
            <KV label="Conflict Style" value={r.styles.conflict} />
            <KV label="What Drives You" value={r.styles.values} />
          </div>
        </Section>

        <Section title="🚀 Career Directions">
          <div className="flex flex-wrap gap-2">
            {r.careers.map((c) => (
              <span key={c} className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                {c}
              </span>
            ))}
          </div>
        </Section>

        <Section title="💬 Answers">
          <div className="space-y-3">
            {(data.answers ?? []).filter(Boolean).map((row) => (
              <div key={row?.qid} className="rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {row?.section} {row?.type === "open" && "· Open answer"}
                </div>
                <div className="mt-1 text-sm font-medium">{row?.text}</div>
                <div className="mt-1 text-sm text-muted-foreground">{row?.answer}</div>
              </div>
            ))}
            {!data.answers?.length && <p className="text-sm text-muted-foreground">No answers stored.</p>}
          </div>
        </Section>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" render={<Link href={`/report/${data.code}`} />}>
            View public report
          </Button>
          <Button render={<Link href="/admin" />}>Back to Dashboard</Button>
        </div>
      </div>
    </main>
  );
}