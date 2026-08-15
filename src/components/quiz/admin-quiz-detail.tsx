"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface Attempt {
  id: string;
  playerName: string;
  score: number;
  total: number;
  createdAt: string;
}

export default function AdminQuizDetail({
  creatorName,
  title,
  code,
  createdAt,
  questions,
  attempts,
}: {
  creatorName: string;
  title: string;
  code: string;
  createdAt: string;
  questions: Question[];
  attempts: Attempt[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const del = async () => {
    if (!confirm("Delete this quiz and all its attempts?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quiz/${code}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("delete failed");
      toast.success("Quiz deleted");
      router.push("/admin");
    } catch {
      toast.error("Could not delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);
  const avg = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-8 pb-16">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-amber-400/25 dark:bg-amber-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-teal-400/25 dark:bg-teal-600/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button variant="destructive" onClick={del} disabled={deleting}>
              <Trash2 className="mr-2 size-4" /> {deleting ? "Deleting..." : "Delete quiz"}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <div className="size-12 grid place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-2xl">
              👀
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">
                by {creatorName} · CODE <span className="font-mono font-bold">{code}</span> ·{" "}
                {new Date(createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Questions", questions.length],
              ["Attempts", attempts.length],
              ["Best Score", best],
              ["Average", avg],
            ].map(([label, value]) => (
              <div key={label} className="glass rounded-2xl p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-3xl p-5">
            <p className="font-semibold mb-3">Questions & correct answers</p>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-4">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.text}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    ✓ {q.options[q.correctIndex] ?? ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="font-semibold mb-3">Attempts (leaderboard)</p>
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No attempts yet.</p>
            ) : (
              <div className="space-y-1.5">
                {attempts.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 odd:bg-black/[0.03] dark:odd:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 text-center text-sm">{["🥇","🥈","🥉"][i] ?? `${i+1}.`}</span>
                      <span className="font-medium text-sm truncate">{a.playerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-display font-bold text-sm">
                        {a.score}/{a.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}