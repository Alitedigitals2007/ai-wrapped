"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    emoji: "👤",
    title: "Enter your username",
    text: "Tell us what to call you. No account, no email, no signup.",
  },
  {
    emoji: "🤖",
    title: "Pick your AI",
    text: "Choose the AI you chat with most — ChatGPT, Gemini, Claude and more.",
  },
  {
    emoji: "📋",
    title: "Copy our magic prompt",
    text: "We craft a perfectly engineered prompt. Paste it into your AI.",
  },
  {
    emoji: "📥",
    title: "Paste its answer back",
    text: "Copy your AI's response and drop it here. We do the rest.",
  },
  {
    emoji: "✨",
    title: "Get your Wrapped",
    text: "A gorgeous, animated breakdown of your AI personality. Share it.",
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
            🎧 Your AI personality, wrapped in style
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Discover how <span className="text-gradient">AI sees you.</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          AI Wrapped turns your AI conversations into a beautiful, shareable
          Spotify Wrapped-style experience. Your personality, scores,
          interests and predictions — in under 3 minutes.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link
            href="/generate"
            className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
          >
            Generate My Wrapped ✨
          </Link>
          <a
            href="#how"
            className="glass rounded-full px-8 py-4 text-lg font-semibold hover:bg-white/[0.08] transition-colors"
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
          Five tiny steps. That&apos;s all it takes to see yourself through the
          eyes of AI.
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
              <span className="absolute top-4 right-5 font-display text-4xl font-bold text-white/5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="text-3xl">{step.emoji}</div>
              <h3 className="mt-4 font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              {i < steps.length - 1 && (
                <span className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-white/20">
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
