"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATE_QUESTIONS, buildQuestions } from "@/lib/quiz/types";
import { QUIZ_PACKS } from "@/lib/quiz/packs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Plus, Trash2, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const EMPTY_QUESTION = { text: "", options: ["", "", "", ""], correctIndex: 0 };

type Draft = { text: string; options: string[]; correctIndex: number };

function QuestionEditor({
  index,
  draft,
  onChange,
  onRemove,
}: {
  index: number;
  draft: Draft;
  onChange: (d: Draft) => void;
  onRemove: () => void;
}) {
  return (
    <div className="glass rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
          Question {index + 1}
        </span>
        <Button variant="ghost" size="icon" onClick={onRemove} className="size-8 text-muted-foreground hover:text-destructive" aria-label="Remove question">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-4">
        <Label htmlFor={`q${index}-text`}>Your question</Label>
        <Input
          id={`q${index}-text`}
          value={draft.text}
          maxLength={120}
          placeholder="e.g. What would I order at a restaurant?"
          onChange={(e) => onChange({ ...draft, text: e.target.value })}
          className="mt-2 h-11"
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {draft.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...draft, correctIndex: oi })}
              title="Mark as the correct answer"
              className={cn(
                "shrink-0 size-8 grid place-items-center rounded-full border text-sm font-bold transition-colors",
                draft.correctIndex === oi
                  ? "bg-gradient-to-br from-teal-500 to-emerald-500 border-transparent text-white"
                  : "border-border/70 text-muted-foreground hover:border-teal-400/60"
              )}
            >
              {String.fromCharCode(65 + oi)}
            </button>
            <Input
              value={opt}
              maxLength={60}
              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
              onChange={(e) => {
                const options = [...draft.options];
                options[oi] = e.target.value;
                onChange({ ...draft, options });
              }}
              className="h-10"
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Tap the letter of the option that is <span className="font-semibold">true about you</span>.
      </p>
    </div>
  );
}

export default function QuizCreatorClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    TEMPLATE_QUESTIONS.map((t) => ({ ...t, correctIndex: 0 }))
  );
  const [activePack, setActivePack] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validCount = useMemo(
    () => drafts.filter((d) => d.text.trim() && d.options.filter((o) => o.trim()).length >= 2).length,
    [drafts]
  );

  const update = (i: number, d: Draft) => {
    setActivePack(null);
    setDrafts((list) => list.map((x, xi) => (xi === i ? d : x)));
  };

  const remove = (i: number) => {
    setActivePack(null);
    setDrafts((list) => list.filter((_, xi) => xi !== i));
  };

  const add = () => {
    setActivePack(null);
    setDrafts((list) => [...list, { ...EMPTY_QUESTION }]);
  };

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Enter your name so friends know who they're guessing.");
    if (validCount === 0) return toast.error("Fill in at least one complete question.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorName: trimmed,
          title: title.trim(),
          questions: buildQuestions(drafts),
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
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-teal-400/30 dark:bg-teal-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 size-96 rounded-full bg-amber-400/25 dark:bg-amber-600/10 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        <div className="mt-6 text-center">
          <div className="mx-auto size-20 grid place-items-center rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-500 text-4xl text-white shadow-2xl shadow-emerald-500/30">
            👀
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Who knows me <span className="text-gradient">best?</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Write your own questions, mark the answers that are true about you, then send the
            code to your friends. Highest score wins the crown. 👑
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/quiz/pack"
            className="group flex items-center justify-between gap-4 glass rounded-3xl px-5 py-4 hover:bg-black/5 dark:hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧩</span>
              <div>
                <div className="font-semibold">Don&apos;t feel like typing?</div>
                <div className="text-sm text-muted-foreground">
                  Play a ready-made pack (Couple, Best Friend, Family…) in under a minute.
                </div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white group-hover:gap-3 transition-all">
              Play a pack →
            </span>
          </Link>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="size-4 text-muted-foreground" />
            <span className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Start from a pack
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <button
              onClick={() => {
                setActivePack(null);
                setDrafts(TEMPLATE_QUESTIONS.map((t) => ({ ...t, correctIndex: 0 })));
              }}
              className={cn(
                "text-left rounded-2xl border p-4 transition-all hover:bg-black/5 dark:hover:bg-white/[0.06]",
                activePack === null
                  ? "border-teal-400/70 bg-teal-500/10 ring-2 ring-teal-400/40"
                  : "border-border/70"
              )}
            >
              <div className="text-2xl">🧑</div>
              <div className="mt-2 font-semibold text-sm">Me & My Quiz</div>
              <div className="mt-1 text-xs text-muted-foreground">Generic starter</div>
            </button>
            {QUIZ_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePack(p.id);
                  setDrafts(p.questions.map((t) => ({ ...t, correctIndex: 0 })));
                }}
                className={cn(
                  "text-left rounded-2xl border p-4 transition-all hover:bg-black/5 dark:hover:bg-white/[0.06]",
                  activePack === p.id
                    ? "border-amber-400/70 bg-amber-500/10 ring-2 ring-amber-400/40"
                    : "border-border/70"
                )}
              >
                <div className="text-2xl">{p.emoji}</div>
                <div className="mt-2 font-semibold text-sm">{p.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            A pack fills the questions below — edit anything you like before publishing.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cname">Your name</Label>
            <Input
              id="cname"
              value={name}
              maxLength={40}
              placeholder="e.g. Alite"
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11"
            />
          </div>
          <div>
            <Label htmlFor="ctitle">Quiz title (optional)</Label>
            <Input
              id="ctitle"
              value={title}
              maxLength={60}
              placeholder="e.g. Do you actually know me?"
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 h-11"
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {drafts.map((d, i) => (
            <QuestionEditor
              key={`q-${i}`}
              index={i}
              draft={d}
              onChange={(next) => update(i, next)}
              onRemove={() => remove(i)}
            />
          ))}

          <Button variant="outline" onClick={add} className="w-full h-12 border-dashed">
            <Plus className="mr-2 size-4" /> Add a question ({validCount} ready)
          </Button>
        </div>

        <div className="mt-8 sticky bottom-4">
          <Button
            onClick={create}
            disabled={submitting || validCount === 0}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 hover:from-teal-500 hover:via-emerald-500 hover:to-cyan-400 shadow-xl shadow-emerald-500/20"
          >
            <Sparkles className="mr-2 size-5" /> Create my quiz & get the code
          </Button>
        </div>
      </div>
    </main>
  );
}