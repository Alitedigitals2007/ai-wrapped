"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

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
          {APP_NAME} turns a short scenario-based test into a beautiful, shareable
          personality report — 15 dimensions, AI-written insights, and a public
          link anyone can open. In under 4 minutes.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link
            href="/personality"
            className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
          >
            Test my personality ✨
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
