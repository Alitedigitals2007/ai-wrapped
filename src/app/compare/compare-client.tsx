"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Analysis } from "@/lib/analysis/types";
import { SCORE_KEYS } from "@/lib/analysis/types";
import { AI_EMOJI } from "@/lib/analysis/prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Loader2, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface WrapData {
  id: string;
  username: string;
  aiUsed: string;
  code: string | null;
  analysis: Analysis;
}

function ScoreBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden dark:bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
        style={{ width: max > 0 ? `${(value / max) * 100}%` : "0%" }}
      />
    </div>
  );
}

function PlayerCard({
  data,
  winner,
}: {
  data: WrapData | null;
  winner: boolean;
}) {
  const a = data?.analysis;
  if (!a) return null;
  return (
    <div className={cn("space-y-6", winner && "order-first md:order-none")}>
      <div className="text-center">
        <div className="mx-auto size-14 grid place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl">
          {AI_EMOJI[data.aiUsed] ?? "🤖"}
        </div>
        <h1 className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-tight">
          {data.username}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.aiUsed} · <span className="font-mono font-bold">{data.code}</span>
        </p>
        {winner && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300">
            👑 Winning the battle
          </span>
        )}
      </div>

      <div className="glass rounded-3xl p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Overall</p>
        <p className="font-display text-5xl font-bold text-gradient">{a.scores.overall}</p>
      </div>

      <div className="glass rounded-3xl p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Scores</p>
        <div className="space-y-3">
          {SCORE_KEYS.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-bold tabular-nums">{a.scores[s.key]}</span>
              </div>
              <ScoreBar value={a.scores[s.key]} max={100} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Personality", a.personality.personalityType],
          ["Archetype", a.personality.aiArchetype],
          ["Top Strength", a.strengths[0] ?? "—"],
          ["Top Interest", a.interests.topTopics[0] ?? "—"],
          ["Top Career", a.career.topMatch],
          ["Best Badge", a.achievements[0] ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 font-semibold text-sm leading-snug">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [meCode, setMeCode] = useState(searchParams.get("me") ?? "");
  const [themCode, setThemCode] = useState(searchParams.get("them") ?? "");
  const [me, setMe] = useState<WrapData | null>(null);
  const [them, setThem] = useState<WrapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!meCode || !themCode) return;
      setLoading(true);
      setError(null);
      const load = async (code: string): Promise<WrapData | null> => {
        const res = await fetch(`/api/lookup?code=${encodeURIComponent(code)}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("load failed");
        return res.json();
      };
      try {
        const [m, t] = await Promise.all([
          load(meCode.toUpperCase()),
          load(themCode.toUpperCase()),
        ]);
        if (!m || !t) {
          const missing = !m ? meCode : themCode;
          setError(`No wrap found with code "${missing.toUpperCase()}". Double-check it.`);
          return;
        }
        setMe(m);
        setThem(t);
      } catch {
        setError("Couldn't load the wraps. Try again.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [meCode, themCode]);

  const start = () => {
    if (meCode.trim().length < 4 || themCode.trim().length < 4) {
      toast.error("Enter both codes first.");
      return;
    }
    setMe(null);
    setThem(null);
    router.replace(`/compare?me=${meCode.toUpperCase()}&them=${themCode.toUpperCase()}`);
  };

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-20 pb-16">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 size-[28rem] rounded-full bg-violet-400/30 dark:bg-violet-600/20 blur-[130px] animate-float-slow" />
        <div className="absolute bottom-0 right-0 size-[26rem] rounded-full bg-fuchsia-400/25 dark:bg-fuchsia-600/20 blur-[130px] animate-float-slower" />
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Wrapped <span className="text-gradient">Battle</span> 🥊
          </h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Enter two AI Wrapped codes to see who comes out on top.
          </p>
        </div>

        <div className="glass rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-center mb-10">
          <Input
            value={meCode}
            onChange={(e) => setMeCode(e.target.value.toUpperCase())}
            placeholder="Your code"
            maxLength={6}
            className="h-12 w-36 text-center font-mono uppercase tracking-[0.2em]"
          />
          <span className="text-muted-foreground font-bold">VS</span>
          <Input
            value={themCode}
            onChange={(e) => setThemCode(e.target.value.toUpperCase())}
            placeholder="Friend's code"
            maxLength={6}
            className="h-12 w-36 text-center font-mono uppercase tracking-[0.2em]"
          />
          <Button
            onClick={start}
            disabled={loading || meCode.trim().length < 4 || themCode.trim().length < 4}
            className="h-12 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600"
          >
            <Swords className="mr-1.5 size-4" /> Battle
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
              Try again
            </Button>
          </div>
        )}

        {me && them && !loading && !error && (
          <div className="space-y-8">
            <p className="text-center text-sm text-muted-foreground">
              Winner by overall score
            </p>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <PlayerCard data={me} winner={me.analysis.scores.overall >= them.analysis.scores.overall} />
              <PlayerCard data={them} winner={them.analysis.scores.overall > me.analysis.scores.overall} />
            </div>
            <p className="text-center text-xs text-muted-foreground/70 pt-4">
              Built by Alite · AI Wrapped
            </p>
          </div>
        )}

        {!me && !them && !loading && !error && (
          <p className="text-center text-sm text-muted-foreground py-10">
            Tip: your wrap&apos;s code is on your share card.
          </p>
        )}
      </div>
    </main>
  );
}
