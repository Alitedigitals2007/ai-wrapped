"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Crown, Loader2, RefreshCw, Sparkles, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayQuestion {
  text: string;
  options: string[];
}

interface LeaderboardRow {
  playerName: string;
  score: number;
  total: number;
  createdAt: string;
}

type Phase = "start" | "play" | "done";

export default function QuizPlayClient({
  code,
  creatorName,
  title,
  questions,
}: {
  code: string;
  creatorName: string;
  title: string;
  questions: PlayQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>("start");
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    results: { correct: boolean; correctIndex: number }[];
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const loadBoard = async () => {
    setLoadingBoard(true);
    try {
      const res = await fetch(`/api/quiz/${code}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard ?? []);
      }
    } catch {
      /* non-fatal */
    } finally {
      setLoadingBoard(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingBoard(true);
      try {
        const res = await fetch(`/api/quiz/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setLeaderboard(data.leaderboard ?? []);
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setLoadingBoard(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const current = questions[index];
  const answerForCurrent = answers[index];

  const start = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return setNameError("Enter your name so we can put it on the board.");
    if (trimmed.length > 40) return setNameError("Keep it under 40 characters.");
    setNameError(null);
    setAnswers([]);
    setIndex(0);
    setPhase("play");
  };

  const pick = (oi: number) => {
    const next = [...answers];
    next[index] = oi;
    setAnswers(next);
    if (index < questions.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 180);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim(), answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
      setResult(data);
      setPhase("done");
      loadBoard();
    } catch {
      toast.error("Network error — check your connection and try again.");
      setSubmitting(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/quiz/${code}`;
    const text = `I just scored ${result?.score}/${result?.total} on ${creatorName}'s quiz. Think you can beat me? 🏆`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} — by ${creatorName}`, text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} → ${url}`);
      toast.success("Challenge copied to clipboard!");
    } catch {
      toast.error("Couldn't copy automatically.");
    }
  };

  const scorePct = result ? Math.round((result.score / result.total) * 100) : 0;
  const verdict =
    result == null
      ? ""
      : scorePct >= 80
        ? `You know ${creatorName} scary well. 👑`
        : scorePct >= 50
          ? `You've got a good read on ${creatorName}. 🔥`
          : scorePct >= 30
            ? `Close, but there's more to ${creatorName}. 🙂`
            : `Uh oh — ${creatorName} is basically a mystery to you. 😅`;
  const best =
    leaderboard.length && leaderboard[0]?.score === result?.score
      ? leaderboard.every((r) => r.score <= (result?.score ?? 0))
      : false;

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-1/4 size-96 rounded-full bg-amber-400/25 dark:bg-amber-600/15 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 size-96 rounded-full bg-teal-400/30 dark:bg-teal-600/20 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        {phase === "start" && (
          <div className="mt-10">
            <div className="text-center">
              <div className="mx-auto size-20 grid place-items-center rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-4xl text-white shadow-2xl shadow-amber-500/30">
                👀
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                {creatorName}&apos;s quiz
              </p>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                {questions.length} questions about {creatorName}. Answer them the way you think{" "}
                {creatorName} would — highest score takes the crown. 👑
              </p>
            </div>

            <div className="mt-8 glass rounded-3xl p-6">
              <Label htmlFor="pname">Your name</Label>
              <Input
                id="pname"
                value={playerName}
                maxLength={40}
                placeholder="e.g. Tunde"
                autoFocus
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
                className="mt-2 h-12 text-lg"
              />
              {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
              <Button
                onClick={start}
                className="mt-5 w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400"
              >
                Start the quiz <Sparkles className="ml-2 size-4" />
              </Button>
            </div>

            <Leaderboard
              rows={leaderboard}
              loading={loadingBoard}
              creatorName={creatorName}
              onRefresh={loadBoard}
              highlightName={null}
            />
          </div>
        )}

        {phase === "play" && current && (
          <div className="mt-10">
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-semibold uppercase tracking-wider">
                  Guess {index + 1} of {questions.length}
                </span>
                <span>Score so far: {answers.filter((a) => a !== undefined).length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/10 overflow-hidden dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all"
                  style={{ width: `${((index + (answerForCurrent !== undefined ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug">
              {current.text}
            </h2>

            <div className="mt-8 space-y-3">
              {current.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => pick(oi)}
                  className={cn(
                    "w-full text-left glass rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-black/5 dark:hover:bg-white/[0.08]",
                    answerForCurrent === oi &&
                      "border-amber-400/70 bg-amber-500/15 ring-2 ring-amber-400/40"
                  )}
                >
                  <span className="size-9 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-white font-bold text-sm">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="font-medium text-sm md:text-base leading-snug">{opt}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="text-muted-foreground"
              >
                <ArrowLeft className="mr-2 size-4" /> Back
              </Button>
              {index === questions.length - 1 ? (
                <Button
                  onClick={submit}
                  disabled={submitting || answers.filter((a) => a !== undefined).length < questions.length}
                  className="h-12 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : "See my score 🏆"}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {answers.filter((a) => a !== undefined).length}/{questions.length} answered
                </span>
              )}
            </div>
          </div>
        )}

        {phase === "done" && result && (
          <div className="mt-10">
            <div className="text-center">
              <div
                className={cn(
                  "mx-auto size-28 grid place-items-center rounded-full border-4 text-5xl shadow-2xl",
                  scorePct >= 80
                    ? "border-amber-300 bg-gradient-to-br from-amber-400 to-yellow-300 shadow-amber-500/40"
                    : scorePct >= 50
                      ? "border-orange-300 bg-gradient-to-br from-orange-400 to-rose-300 shadow-orange-500/40"
                      : "border-teal-300 bg-gradient-to-br from-teal-400 to-emerald-300 shadow-teal-500/40"
                )}
              >
                {best ? "👑" : scorePct >= 50 ? "🔥" : "🙃"}
              </div>
              <p className="mt-5 font-display text-6xl font-bold">
                {result.score}<span className="text-3xl text-muted-foreground">/{result.total}</span>
              </p>
              <p className="mt-2 font-display text-xl font-semibold">{verdict}</p>
              {best && (
                <p className="mt-1 text-sm text-amber-500 font-semibold">
                  You&apos;re currently top of the leaderboard!
                </p>
              )}
            </div>

            <div className="mt-8 glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                What you got right
              </p>
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const r = result.results[i];
                  return (
                    <div
                      key={q.text}
                      className={cn(
                        "flex items-start gap-3 rounded-xl px-3 py-2 text-sm",
                        r?.correct ? "bg-emerald-500/10" : "bg-rose-500/10"
                      )}
                    >
                      <span className="text-base">{r?.correct ? "✅" : "❌"}</span>
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{q.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your pick: {q.options[answers[i]]} · {creatorName} picked:{" "}
                          <span className="font-semibold text-foreground">
                            {q.options[r?.correctIndex ?? 0]}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={share}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
              >
                <Share2 className="mr-2 size-4" /> Challenge friends
              </Button>
              <Button variant="outline" onClick={() => setPhase("play")} className="flex-1 h-12">
                <RefreshCw className="mr-2 size-4" /> Try again
              </Button>
            </div>

            <Leaderboard
              rows={leaderboard}
              loading={loadingBoard}
              creatorName={creatorName}
              onRefresh={loadBoard}
              highlightName={playerName.trim()}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function Leaderboard({
  rows,
  loading,
  creatorName,
  onRefresh,
  highlightName,
}: {
  rows: LeaderboardRow[];
  loading: boolean;
  creatorName: string;
  onRefresh: () => void;
  highlightName: string | null;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="mt-8 glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-2 font-semibold">
          <Crown className="size-4 text-amber-500" /> Who knows {creatorName} best?
        </p>
        <button
          onClick={onRefresh}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-3">
          No scores yet. Be the first — and set the bar. 🎯
        </p>
      ) : (
        <div className="space-y-1.5">
          {rows.slice(0, 10).map((r, i) => {
            const isMe = highlightName && r.playerName.toLowerCase() === highlightName.toLowerCase();
            return (
              <div
                key={`${r.playerName}-${r.createdAt}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                  isMe ? "bg-amber-500/15 ring-1 ring-amber-400/40" : "odd:bg-black/[0.03] dark:odd:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 text-center text-base">{medals[i] ?? `${i + 1}.`}</span>
                  <span className="font-medium text-sm truncate">{r.playerName}</span>
                  {isMe && <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 uppercase">you</span>}
                </div>
                <span className="font-display font-bold text-sm">
                  {r.score}/{r.total}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}