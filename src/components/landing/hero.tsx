"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { Reveal } from "./shared";

const steps = [
  {
    emoji: "👤",
    title: "Enter your name",
    text: "No account, no email, no signup. Just a display name.",
  },
  {
    emoji: "🎯",
    title: "Answer scenarios",
      text: "A few short situations — what you'd do, why, what you value.",
  },
  {
    emoji: "🧬",
    title: "Get 15 dimensions",
    text: "Extraversion to risk tolerance, measured from your choices.",
  },
  {
    emoji: "✨",
    title: "AI writes your report",
    text: "A warm, human narrative of your personality — not just labels.",
  },
  {
    emoji: "🔗",
    title: "Share & compare",
    text: "A public link, a PNG card, and head-to-head battles by code.",
  },
];

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="glass rounded-full px-4 py-1.5 text-sm text-muted-foreground">
            🧠 Your personality, wrapped in style
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Know <span className="text-gradient">yourself.</span>
          <br />
          Share it.
        </motion.h1>

<motion.p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {APP_NAME} is a playground of fun: a scenario-based personality test, a
          &ldquo;Who knows me best?&rdquo; quiz for you and your friends, a question a day to
          reflect on, financial statement intelligence, and the classic AI Wrapped story.
          All free, no account needed.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link
            href="/personality"
            className="rounded-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
          >
            Test my personality ✨
          </Link>
          <Link
            href="/quiz"
            className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
          >
            Make a quiz 👀
          </Link>
          <a
            href="#how"
            className="glass rounded-full px-8 py-4 text-lg font-semibold hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
          >
            See how it works
          </a>
        </motion.div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <span>⚡ No account needed</span>
          <span>🔒 Private by default</span>
          <span>📱 Mobile-first</span>
          <span>🆓 Free</span>
        </motion.div>
      </div>
    </section>
  );
}

export function Choose() {
  const options = [
    {
      href: "/personality",
      emoji: "🧠",
      title: "Personality Test",
      tag: "New",
      text: "Answer short scenarios, get 15 dimensions scored, and receive an AI-written personality report you can share by link.",
      cta: "Test my personality ✨",
      grad: "bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-500",
      time: "~3 min",
    },
    {
      href: "/quiz",
      emoji: "👀",
      title: "Who Knows Me Best?",
      tag: "Game",
      text: "Write your own questions about you, send the code, and see which friend really knows you best.",
      cta: "Make a quiz 👀",
      grad: "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500",
      time: "~2 min",
    },
    {
      href: "/generate",
      emoji: "🤖",
      title: "AI Wrapped",
      tag: "Classic",
      text: "Paste your AI chats and get the original Wrapped-style story — your personality, strengths, career match and predictions.",
      cta: "Generate an AI Wrap 🤖",
      grad: "bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-600",
      time: "~30 sec",
    },
    {
      href: "/daily",
      emoji: "🌅",
      title: "Daily Question",
      tag: "Ritual",
      text: "One new question every day. Answer it, get an instant read, and build a habit of checking in with yourself.",
      cta: "Answer today's ✨",
      grad: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500",
      time: "~10 sec",
    },
    {
      href: "/finsight",
      emoji: "📊",
      title: "FinSight",
      tag: "Money",
      text: "Upload your bank statement (Excel) and get cash flow analysis, spending breakdown, pattern detection, and risk scoring.",
      cta: "Analyze statement 📊",
      grad: "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500",
      time: "~1 min",
    },
  ];
  return (
    <section id="choose" className="px-4 py-24 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            What do you want to <span className="text-gradient">try?</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Four ways to have fun — pick one, or do them all.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {options.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.1}>
              <Link
                href={o.href}
                className={`group relative block overflow-hidden rounded-[2.5rem] ${o.grad} p-8 text-white hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-2xl shadow-black/20 h-full`}
              >
                <span className="absolute -top-10 -right-10 size-48 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-5xl">{o.emoji}</span>
                    <span className="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      {o.tag} · {o.time}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-3xl font-bold">{o.title}</h3>
                  <p className="mt-3 text-white/80 leading-relaxed">{o.text}</p>
                  <span className="mt-auto pt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black group-hover:gap-3 transition-all">
                    {o.cta} →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="px-4 py-24 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-center tracking-tight">
          How it <span className="text-gradient">works</span>
        </h2>
        <p className="mt-4 text-center text-muted-foreground max-w-xl mx-auto">
          Four tiny steps. That&apos;s all it takes to see yourself clearly.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="glass rounded-3xl p-6 relative"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <span className="absolute top-4 right-5 font-display text-4xl font-bold text-black/5 dark:text-white/5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="text-3xl">{step.emoji}</div>
              <h3 className="mt-4 font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              {i < steps.length - 1 && (
                <span className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-black/10 dark:text-white/20">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
