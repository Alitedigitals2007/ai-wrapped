"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QUESTIONS, MCQ_COUNT, TOTAL_COUNT } from "@/lib/personality/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, ArrowRight, Sparkles, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "intro" | "quiz" | "open" | "loading";

const LOADING_MESSAGES = [
  "Reading your choices...",
  "Mapping your social energy...",
  "Measuring your decision style...",
  "Calibrating conflict style...",
  "Reading between the lines...",
  "Finding your strengths...",
  "Writing your personality report...",
];

export default function PersonalityTestClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const mcqs = useMemo(() => QUESTIONS.filter((q) => q.type === "mcq"), []);
  const opens = useMemo(() => QUESTIONS.filter((q) => q.type === "open"), []);

  const current = mcqs[index];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / TOTAL_COUNT) * 100);
  const answerForCurrent = current ? answers[current.id] : undefined;

  const startQuiz = () => {
    const trimmed = name.trim();
    if (!trimmed) return setNameError("Your name is required so we can personalize the report.");
    if (trimmed.length > 40) return setNameError("Keep it under 40 characters.");
    setNameError(null);
    setPhase("quiz");
  };

  const pick = (qid: string, value: string) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (index < mcqs.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 180);
    } else {
      setPhase("open");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setPhase("loading");
    const timer = setInterval(
      () => setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length),
      1600
    );
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), answers }),
      });
      const data = await res.json();
      clearInterval(timer);
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        setPhase("open");
        setSubmitting(false);
        return;
      }
      toast.success("Your personality report is ready!");
      router.push(data.url);
    } catch {
      clearInterval(timer);
      toast.error("Network error — check your connection and try again.");
      setPhase("open");
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-28 pb-20 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-teal-400/30 dark:bg-teal-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 size-96 rounded-full bg-cyan-400/25 dark:bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center mb-10">
                <div className="mx-auto size-20 grid place-items-center rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-500 text-4xl text-white shadow-2xl shadow-emerald-500/30">
                  🧠
                </div>
                <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
                  What&apos;s your <span className="text-gradient">personality?</span>
                </h1>
                <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                  Answer {MCQ_COUNT} short scenario questions plus a few about yourself. No right or
                  wrong answers — just be honest. It takes about 3 minutes.
                </p>
              </div>

              <div className="glass rounded-3xl p-6 md:p-8">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["🧭", "15 personality dimensions"],
                    ["🎯", "Scenario-based, not labels"],
                    ["✨", "AI-written report"],
                    ["🔗", "Shareable + comparable"],
                  ].map(([e, t]) => (
                    <div key={t} className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-3">
                      <div className="text-lg">{e}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{t}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="pname">Your name</Label>
                  <Input
                    id="pname"
                    placeholder="e.g. Alite"
                    value={name}
                    maxLength={40}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startQuiz()}
                    className="text-lg h-12"
                  />
                  {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>

                <Button
                  onClick={startQuiz}
                  className="mt-6 w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 hover:from-teal-500 hover:via-emerald-500 hover:to-cyan-400"
                >
                  Start the test <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "quiz" && current && (
            <motion.div
              key={`q-${index}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold uppercase tracking-wider">{current.section}</span>
                  <span>
                    {index + 1} / {mcqs.length}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/10 overflow-hidden dark:bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500"
                    animate={{ width: `${(index / mcqs.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug min-h-[3.5rem]">
                {current.text}
              </h2>

              <div className="mt-8 space-y-3">
                {current.options.map((opt, i) => (
                  <motion.button
                    key={opt.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i }}
                    onClick={() => pick(current.id, opt.key)}
                    className={cn(
                      "w-full text-left glass rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-black/5 dark:hover:bg-white/[0.08]",
                      answerForCurrent === opt.key &&
                        "border-teal-400/70 bg-teal-500/15 ring-2 ring-teal-400/40"
                    )}
                  >
                    <span className="size-9 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white font-bold text-sm">
                      {opt.emoji}
                    </span>
                    <span className="font-medium text-sm md:text-base leading-snug">{opt.label}</span>
                  </motion.button>
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
                <span className="text-xs text-muted-foreground">
                  {progress}% complete · {answered}/{TOTAL_COUNT}
                </span>
              </div>
            </motion.div>
          )}

          {phase === "open" && (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                  A little more <span className="text-gradient">about you</span>
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Six optional questions. They help the AI write a warmer, more personal report.
                </p>
              </div>

              <div className="space-y-5">
                {opens.map((q) => (
                  <div key={q.id} className="glass rounded-3xl p-5">
                    <Label htmlFor={`open-${q.id}`} className="text-base font-semibold">
                      {q.text}
                    </Label>
                    <Textarea
                      id={`open-${q.id}`}
                      placeholder={q.placeholder}
                      value={answers[q.id] ?? ""}
                      maxLength={q.maxLength}
                      rows={2}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className="mt-3 text-sm resize-y"
                    />
                    <div className="text-right text-[11px] text-muted-foreground">
                      {q.maxLength ? `${(answers[q.id] ?? "").length}/${q.maxLength}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" onClick={() => setPhase("quiz")} className="h-12 px-5">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 hover:from-teal-500 hover:via-emerald-500 hover:to-cyan-400"
                >
                  <Sparkles className="mr-2 size-4" /> Build my personality report
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto size-24 rounded-full border-4 border-black/10 dark:border-white/10 border-t-emerald-500 border-r-teal-500 border-b-cyan-500"
              />
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsg}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-8 font-display text-2xl font-semibold"
                >
                  {LOADING_MESSAGES[loadingMsg]}
                </motion.p>
              </AnimatePresence>
              <p className="mt-3 text-sm text-muted-foreground">
                <Brain className="inline size-4 mr-1.5" />
                Our AI is reading your {answered} answers...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}