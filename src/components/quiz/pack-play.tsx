"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizPack } from "@/lib/quiz/packs";

export default function PackPlayClient({ pack }: { pack: QuizPack }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<number[]>(() => pack.questions.map(() => -1));
  const [submitting, setSubmitting] = useState(false);

  const total = pack.questions.length;
  const answeredCount = useMemo(() => answers.filter((a) => a >= 0).length, [answers]);
  const done = answeredCount === total;

  const pick = (qi: number, oi: number) =>
    setAnswers((list) => list.map((a, i) => (i === qi ? oi : a)));

  const start = async () => {
    if (!name.trim()) return toast.error("Enter your name so friends know who they're guessing.");
    if (!done) return toast.error(`Answer all ${total} questions first.`);
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorName: name.trim(),
          title: `${pack.emoji} ${pack.title}`,
          questions: pack.questions.map((q, i) => ({
            text: q.text,
            options: q.options,
            correctIndex: answers[i],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
      toast.success("Quiz created! Share the code with your friends.");
      router.push(data.url);
    } catch {
      toast.error("Network error — check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/25 dark:bg-amber-600/15 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 size-96 rounded-full bg-rose-400/25 dark:bg-rose-600/15 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Link
            href="/quiz/pack"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> All packs
          </Link>
          <span className="glass rounded-full px-4 py-1.5 text-sm text-muted-foreground">
            {answeredCount}/{total} answered
          </span>
        </div>

        <div className="mt-8 text-center">
          <div className="text-6xl">{pack.emoji}</div>
          <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight">
            {pack.title}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            {pack.description} Tap the answer that&apos;s <span className="font-semibold text-foreground">true about you</span>.
          </p>
        </div>

        <div className="mt-8">
          <Label htmlFor="pack-name">Your name</Label>
          <Input
            id="pack-name"
            value={name}
            maxLength={40}
            placeholder="e.g. Alite"
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-11"
          />
        </div>

        <div className="mt-8 space-y-4">
          {pack.questions.map((q, qi) => (
            <div key={qi} className="glass rounded-3xl p-5 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
                  Question {qi + 1}
                </span>
                {answers[qi] >= 0 && (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
                    ✓ picked
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold leading-snug">{q.text}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const active = answers[qi] === oi;
                  return (
                    <motion.button
                      key={oi}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => pick(qi, oi)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                        active
                          ? "border-amber-400/80 bg-amber-500/15 ring-2 ring-amber-400/40"
                          : "border-border/60 hover:bg-black/5 dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 size-7 grid place-items-center rounded-full border text-xs font-bold transition-colors",
                          active
                            ? "bg-gradient-to-br from-amber-500 to-rose-500 border-transparent text-white"
                            : "border-border/70 text-muted-foreground"
                        )}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-sm font-medium leading-snug">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sticky bottom-4">
          <Button
            onClick={start}
            disabled={submitting || !done || !name.trim()}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 shadow-xl shadow-amber-500/20"
          >
            <Sparkles className="mr-2 size-5" />
            {done ? "Start the game & get the code" : `Answer ${total - answeredCount} more`}
          </Button>
        </div>
      </div>
    </main>
  );
}