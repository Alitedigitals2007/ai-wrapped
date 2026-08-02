"use client";

import { Reveal } from "./shared";
import Link from "next/link";

const features = [
  {
    emoji: "🧬",
    title: "Personality deep-dive",
    text: "Personality type, AI archetype, thinking style, communication style and more — extracted from your AI's own words about you.",
  },
  {
    emoji: "📊",
    title: "8 skill scores",
    text: "Creativity, leadership, communication, learning, productivity, problem solving, critical thinking and innovation — out of 100.",
  },
  {
    emoji: "🗣️",
    title: "Language fingerprint",
    text: "Your most used words and phrases, vocabulary level, writing and prompt style — the way you talk to AI, decoded.",
  },
  {
    emoji: "🏆",
    title: "Achievements & badges",
    text: "Researcher, Builder, Innovator, Night Owl, AI Power User — unlock the badges your usage actually deserves.",
  },
  {
    emoji: "💼",
    title: "Career matches",
    text: "Top 3 careers that fit your AI personality, plus predictions for your next skill, book and project.",
  },
  {
    emoji: "🎨",
    title: "Animated Wrapped",
    text: "A Spotify Wrapped-style experience with 12 full-screen animated cards. Swipe on mobile, share anywhere.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Everything you always wanted to know
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            about the way you use AI — served in one beautiful experience.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="glass rounded-3xl p-7 h-full hover:bg-white/[0.07] transition-colors group">
                <div className="size-12 grid place-items-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 text-2xl group-hover:scale-110 transition-transform">
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
            className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-fuchsia-600/30 blur-[100px]"
          />
          <h2 className="relative font-display text-3xl md:text-5xl font-bold tracking-tight">
            Ready to see yourself <span className="text-gradient">through AI&apos;s eyes?</span>
          </h2>
          <p className="relative mt-4 text-muted-foreground max-w-md mx-auto">
            Takes under 3 minutes. No account. No email. Just you, your AI, and a Wrapped worth sharing.
          </p>
          <a
            href="/generate"
            className="relative mt-8 inline-block rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
          >
            Generate My Wrapped ✨
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: "Do I need an account?",
      a: "Nope. AI Wrapped works entirely with a username — no email, no password, no signup. Your Wrapped is stored so you can come back to it, but you stay anonymous.",
    },
    {
      q: "How does it know my personality?",
      a: "You paste a response from your AI (generated with our engineered prompt). We analyze that text with an LLM to extract your personality type, scores, interests, strengths and more.",
    },
    {
      q: "Which AIs are supported?",
      a: "ChatGPT, Gemini, Claude, Grok, DeepSeek, Perplexity, Microsoft Copilot, Meta AI, Qwen, Kimi, Mistral AI — and an Other option for anything else.",
    },
    {
      q: "Is my conversation private?",
      a: "Yes. We only see the response you paste, and we never share or sell your data. The pasted text is used once to build your Wrapped.",
    },
    {
      q: "Can I download or share my Wrapped?",
      a: "Absolutely. The final card downloads as a PNG image, and you can share it on any social platform with one tap.",
    },
    {
      q: "How accurate are the scores?",
      a: "Scores are estimates derived from how your AI describes you. They're fun and insightful — think of them as a personality mirror, not a scientific test.",
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
              className="glass rounded-2xl px-6 py-4 group open:bg-white/[0.06] transition-colors"
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
  return (
    <footer className="px-4 py-10 border-t border-white/5">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-display font-bold text-foreground">
          <span className="grid place-items-center size-7 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white text-sm">
            🪄
          </span>
          AI Wrapped
        </div>
        <p>Discover how AI sees you. © {new Date().getFullYear()}</p>
        <div className="flex gap-5">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <Link href="/admin/login" className="hover:text-foreground transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
