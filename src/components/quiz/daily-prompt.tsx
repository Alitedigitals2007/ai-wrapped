"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getDailyQuestion, nextDailyReset } from "@/lib/quiz/daily";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, RefreshCw, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DailyPromptClient() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const q = useMemo(() => getDailyQuestion(now), [now]);
  const reset = useMemo(() => nextDailyReset(now), [now]);
  const chosen = q.options.find((o) => o.key === picked);

  const msLeft = reset.getTime() - now.getTime();
  const h = Math.floor(msLeft / 3_600_000);
  const m = Math.floor((msLeft % 3_600_000) / 60_000);

  const share = async () => {
    const text = picked
      ? `Today I learned I'm: "${chosen?.result ?? ""}" 🤯 — answer today's question on Aura!`
      : `There's a question a day on Aura — what would you answer? ✨`;
    const url = `${window.location.origin}/daily`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Today's Question — Aura", text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} → ${url}`);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Couldn't copy automatically.");
    }
  };

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-sky-400/25 dark:bg-sky-600/15 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 size-96 rounded-full bg-amber-400/25 dark:bg-amber-600/15 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        <div className="mt-8 text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted-foreground">
            🔄 Today&apos;s question · resets in {h}h {m}m
          </span>
          <div className="mt-6 text-6xl">{q.emoji}</div>
          <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight leading-snug">
            {q.text}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick what you&apos;d really do. New question every day.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {q.options.map((opt, i) => {
            const isPicked = picked === opt.key;
            return (
              <motion.button
                key={opt.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                onClick={() => setPicked(opt.key)}
                disabled={picked !== null}
                className={cn(
                  "w-full text-left glass rounded-2xl p-4 flex items-center gap-4 transition-all",
                  isPicked
                    ? "border-sky-400/70 bg-sky-500/15 ring-2 ring-sky-400/40"
                    : "hover:bg-black/5 dark:hover:bg-white/[0.08]"
                )}
              >
                <span className="size-9 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 text-white font-bold text-sm">
                  {opt.emoji}
                </span>
                <span className="font-medium text-sm md:text-base leading-snug">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {chosen && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 glass rounded-3xl p-6 text-center"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Your daily read
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">{chosen.result}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button onClick={share} className="flex-1 bg-gradient-to-r from-sky-600 to-cyan-600">
                  <Share2 className="mr-2 size-4" /> Share today
                </Button>
                <Button variant="outline" onClick={() => setPicked(null)} className="flex-1">
                  <RefreshCw className="mr-2 size-4" /> Choose again
                </Button>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                Want the full picture? Take the{" "}
                <Link href="/personality" className="font-semibold text-foreground underline underline-offset-2 hover:opacity-80">
                  15-dimension personality test
                </Link>{" "}
                — it takes ~3 minutes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!chosen && (
          <p className="mt-6 text-center text-xs text-muted-foreground/80">
            <Sparkles className="inline size-3.5 mr-1" />
            Come back tomorrow for a new one.
          </p>
        )}
      </div>
    </main>
  );
}