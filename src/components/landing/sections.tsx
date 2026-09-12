"use client";

import { Reveal } from "./shared";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

const features = [
  {
    emoji: "🧠",
    title: "15 personality dimensions",
    text: "Extraversion, openness, risk tolerance, empathy, ambition and more — each measured 0–100 from your scenario choices.",
  },
  {
    emoji: "👀",
    title: "Who knows me best?",
    text: "Write your own questions about you, share the code, and let friends battle to the top of your leaderboard.",
  },
  {
    emoji: "✨",
    title: "AI-written narrative",
    text: "An LLM turns your scores and written answers into a warm, human report — archetype, styles, strengths and blind spots.",
  },
  {
    emoji: "🔗",
    title: "Shareable links",
    text: "Every report and quiz gets a public URL and a 6-character code. Send it to anyone — no account needed.",
  },
  {
    emoji: "📸",
    title: "Download as PNG",
    text: "Beautiful Wrapped-style cards, downloadable as PNGs for your stories, dates and group chats.",
  },
  {
    emoji: "🥊",
    title: "Head-to-head compare",
    text: "Battle two reports (or two AI wraps) by code and see whose personality wins on the scoreboard.",
  },
  {
    emoji: "🌅",
    title: "A question a day",
    text: "A new scenario every day. Pick your move, get an instant read, and keep a tiny ritual of self-reflection.",
  },
  {
    emoji: "📊",
    title: "Financial Statement Intelligence",
    text: "Upload Excel statements, get cash flow charts, spending categories, pattern detection, risk scores, and AI explanations.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Everything you&apos;ll learn about yourself
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            served in one beautiful, shareable experience.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="glass rounded-3xl p-7 h-full hover:bg-black/5 dark:hover:bg-white/[0.07] transition-colors group">
                <div className="size-12 grid place-items-center rounded-2xl bg-gradient-to-br from-teal-600/30 to-emerald-600/30 text-2xl group-hover:scale-110 transition-transform">
                  {f.emoji}
                </div>
                <h3 className="mt-5 font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="px-4 py-24">
      <Reveal className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-[2.5rem] glass px-8 py-16 text-center">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-emerald-400/40 dark:bg-emerald-600/30 blur-[100px]"
          />
          <h2 className="relative font-display text-3xl md:text-5xl font-bold tracking-tight">
            Ready to meet <span className="text-gradient">yourself?</span>
          </h2>
          <p className="relative mt-4 text-muted-foreground max-w-md mx-auto">
            Take the personality test, make a &quot;Who knows me best?&quot; quiz, answer
            today&apos;s daily question, or wrap your AI chats. No account. No email. Just
            fun and a report worth sharing.
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/personality"
              className="inline-block rounded-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
            >
              Test my personality ✨
            </Link>
            <Link
              href="/quiz"
              className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
            >
              Make a quiz 👀
            </Link>
            <Link
              href="/finsight"
              className="inline-block rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
            >
              Analyze statement 📊
            </Link>
            <Link
              href="/generate"
              className="inline-block rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
            >
              Generate an AI Wrap 🤖
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: "Do I need an account?",
      a: "Nope. The personality test works entirely with your name — no email, no password, no signup. Your report is stored so you can share it and come back to it.",
    },
    {
      q: "How does it know my personality?",
      a: "You answer short scenario questions (situations, decisions, values, conflicts) plus a few written prompts. We score 15 dimensions from your choices, then an LLM writes a human-readable report from the pattern.",
    },
    {
      q: "Is this a scientific test?",
      a: "It's a personality mirror, not a clinical assessment. It identifies patterns and tendencies in your responses — a useful nudge to reflect, not a verdict on who you are.",
    },
    {
      q: "Can I download or share my report?",
      a: "Absolutely. Every report gets a public link and a 6-character code. Cards download as PNG images, and two reports can be compared head-to-head by code.",
    },
    {
      q: "What if I skip all the written questions?",
      a: "You can leave the written questions blank — your dimension scores still work. Answering them just lets the AI write a warmer, more personal report.",
    },
  ];
  return (
    <section id="faq" className="px-4 py-24 scroll-mt-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="glass rounded-2xl px-6 py-4 group open:bg-black/5 dark:open:bg-white/[0.06] transition-colors"
            >
              <summary className="flex items-center justify-between font-medium cursor-pointer list-none">
                {f.q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const APP_URL = "myalite.vercel.app";
  return (
    <footer className="px-4 py-10 border-t border-black/5 dark:border-white/5">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-display font-bold text-foreground">
          <span className="grid place-items-center size-7 rounded-full bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-400 text-white text-sm">
            🧠
          </span>
          {APP_NAME}
        </div>
        <p>Know yourself. Share it. © {new Date().getFullYear()}</p>
        <div className="flex gap-5 items-center">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <Link href="/admin/login" className="hover:text-foreground transition-colors">Admin</Link>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1.5">
            <a href={`https://${APP_URL}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">
              {APP_URL}
            </a>
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1.5">
            Built by <span className="font-semibold text-foreground">Alite</span>
            <a
              href="https://wa.me/2349154681851?text=Well%20done%20on%20AI%20Wrapped%2C%20Alite!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              aria-label="Message Alite on WhatsApp"
            >
              💬
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
