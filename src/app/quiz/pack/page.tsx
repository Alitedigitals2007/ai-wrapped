import type { Metadata } from "next";
import Link from "next/link";
import { QUIZ_PACKS } from "@/lib/quiz/packs";

export const metadata: Metadata = {
  title: "Play a Quiz Pack — Aura",
  description:
    "Pick a ready-made quiz pack, answer about yourself in under a minute, and get a code to challenge your friends.",
};

export default function PackIndexPage() {
  return (
    <main className="relative flex-1 min-h-screen px-4 pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/25 dark:bg-amber-600/15 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 size-96 rounded-full bg-rose-400/25 dark:bg-rose-600/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="mx-auto size-20 grid place-items-center rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-4xl text-white shadow-2xl shadow-amber-500/30">
            🧩
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Play a quiz <span className="text-gradient">pack</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            No typing needed. Pick a pack, answer the questions about yourself, and
            you&apos;ll get a code to challenge your friends in under a minute.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {QUIZ_PACKS.map((p) => (
            <Link
              key={p.id}
              href={`/quiz/pack/${p.id}`}
              className="group glass rounded-3xl p-6 hover:bg-black/5 dark:hover:bg-white/[0.07] transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{p.emoji}</span>
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {p.questions.length} questions
                </span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white group-hover:gap-3 transition-all">
                Play this pack →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Want to write your own questions instead?{" "}
          <Link href="/quiz" className="font-semibold text-foreground underline underline-offset-2 hover:opacity-80">
            Create a custom quiz
          </Link>
        </p>
      </div>
    </main>
  );
}