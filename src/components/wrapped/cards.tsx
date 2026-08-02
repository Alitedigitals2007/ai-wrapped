"use client";

import { motion } from "framer-motion";
import type { Analysis } from "@/lib/analysis/types";
import { SCORE_KEYS } from "@/lib/analysis/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-violet-600/30 via-fuchsia-600/20 to-transparent",
  "from-fuchsia-600/30 via-pink-600/20 to-transparent",
  "from-cyan-500/25 via-sky-600/20 to-transparent",
  "from-emerald-500/25 via-teal-600/20 to-transparent",
  "from-amber-500/25 via-orange-600/20 to-transparent",
];

export function CardShell({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[2rem] glass",
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute -top-24 -right-24 size-72 rounded-full bg-gradient-to-br blur-[80px]",
          accent ?? GRADIENTS[0]
        )}
      />
      <div className="relative h-full flex flex-col p-8 md:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
      {children}
    </div>
  );
}

function LevelDots({ level }: { level: string }) {
  const value =
    level.toLowerCase().includes("very high") || level.toLowerCase().includes("exceptional")
      ? 5
      : level.toLowerCase().includes("high")
        ? 4
        : level.toLowerCase().includes("moderate")
          ? 3
          : level.toLowerCase().includes("low") && level.toLowerCase().includes("very")
            ? 1
            : level.toLowerCase().includes("low")
              ? 2
              : 3;
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full",
            i <= value ? "bg-gradient-to-r from-violet-400 to-fuchsia-400" : "bg-white/15"
          )}
        />
      ))}
    </div>
  );
}

export function WelcomeCard({
  username,
  aiUsed,
  aiEmoji,
  date,
}: {
  username: string;
  aiUsed: string;
  aiEmoji: string;
  date: string;
}) {
  return (
    <CardShell accent="from-violet-600/40 via-fuchsia-600/25 to-transparent">
      <div className="my-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto size-24 grid place-items-center rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-5xl shadow-2xl shadow-fuchsia-500/30"
        >
          {aiEmoji}
        </motion.div>
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-muted-foreground">AI Wrapped presents</p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight text-gradient">
          {username}
        </h1>
        <p className="mt-4 text-muted-foreground">
          Powered by {aiUsed} · {date}
        </p>
      </div>
    </CardShell>
  );
}

export function PersonalityCard({ analysis }: { analysis: Analysis }) {
  const p = analysis.personality;
  return (
    <CardShell accent="from-fuchsia-600/35 via-pink-600/20 to-transparent">
      <CardLabel>Your Personality</CardLabel>
      <div className="mt-2">
        <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          The <span className="text-gradient">{p.personalityType}</span>
        </h2>
        <p className="mt-2 text-muted-foreground">AI Archetype: {p.aiArchetype}</p>
      </div>
      <div className="mt-auto space-y-5 pt-8">
        {[
          ["Confidence", p.confidenceLevel],
          ["Curiosity", p.curiosityLevel],
          ["Creativity", p.creativityLevel],
        ].map(([label, level]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{level}</span>
              <LevelDots level={level} />
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

export function ThinkingCard({ analysis }: { analysis: Analysis }) {
  const p = analysis.personality;
  const rows = [
    ["Thinking Style", p.thinkingStyle],
    ["Decision Style", p.decisionStyle],
    ["Leadership Style", p.leadershipStyle],
    ["Learning Style", p.learningStyle],
  ];
  return (
    <CardShell accent="from-cyan-500/30 via-sky-600/20 to-transparent">
      <CardLabel>How You Think</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your thinking <span className="text-gradient">style</span>
      </h2>
      <div className="mt-8 grid gap-3">
        {rows.map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 font-display text-xl font-semibold">{value}</div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

export function ScoresCard({ analysis }: { analysis: Analysis }) {
  const { scores } = analysis;
  return (
    <CardShell accent="from-violet-600/40 via-fuchsia-600/25 to-transparent">
      <CardLabel>Your Scores</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Out of <span className="text-gradient">100</span>
      </h2>
      <div className="mt-8 space-y-4">
        {SCORE_KEYS.map((s, i) => (
          <div key={s.key}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-semibold">{scores[s.key]}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{ width: `${scores[s.key]}%` }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between rounded-2xl bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/70">Overall Score</div>
          <div className="font-display text-2xl font-bold">AI Power Level</div>
        </div>
        <div className="font-display text-6xl font-bold text-gradient">{scores.overall}</div>
      </div>
    </CardShell>
  );
}

export function CommunicationCard({ analysis }: { analysis: Analysis }) {
  const l = analysis.language;
  return (
    <CardShell accent="from-emerald-500/30 via-teal-600/20 to-transparent">
      <CardLabel>How You Talk to AI</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your voice<span className="text-gradient">print</span>
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {[
          ["Most Used Word", `"${l.mostUsedWord}"`],
          ["Most Used Phrase", `"${l.mostUsedPhrase}"`],
          ["Vocabulary", l.vocabularyLevel],
          ["Writing Style", l.writingStyle],
          ["Prompt Style", l.promptStyle],
          ["Question Style", l.questionStyle],
          ["Complexity", l.averageComplexity],
          ["Communication", analysis.personality.communicationStyle],
        ].map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="glass rounded-2xl p-4"
          >
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 font-semibold text-base leading-snug">{value}</div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

export function InterestsCard({ analysis }: { analysis: Analysis }) {
  const { interests } = analysis;
  return (
    <CardShell accent="from-amber-500/30 via-orange-600/20 to-transparent">
      <CardLabel>Your Interests</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        What you&apos;re <span className="text-gradient">into</span>
      </h2>
      <div className="mt-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Top Topics</div>
        <div className="flex flex-wrap gap-2">
          {interests.topTopics.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="rounded-full border border-white/10 bg-gradient-to-r from-violet-600/25 to-fuchsia-600/25 px-4 py-2 font-semibold"
            >
              {t}
            </motion.span>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Favorite Domain</div>
            <div className="mt-1 font-display text-xl font-bold">{interests.favoriteDomain}</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Most Discussed</div>
            <div className="mt-1 font-display text-xl font-bold">{interests.mostDiscussedArea}</div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export function StrengthsCard({ analysis }: { analysis: Analysis }) {
  return (
    <CardShell accent="from-emerald-500/30 via-teal-600/20 to-transparent">
      <CardLabel>Your Strengths</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        What makes you <span className="text-gradient">great</span>
      </h2>
      <div className="mt-8 space-y-3">
        {analysis.strengths.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex items-center gap-4 glass rounded-2xl p-4"
          >
            <span className="font-display text-2xl font-bold text-white/20">{i + 1}</span>
            <span className="font-semibold text-lg">{s}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Growth Areas</div>
        <div className="flex flex-wrap gap-2">
          {analysis.improvement.map((imp) => (
            <Badge key={imp} variant="secondary" className="px-3 py-1.5">
              {imp}
            </Badge>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

export function FunFactsCard({ analysis }: { analysis: Analysis }) {
  const f = analysis.fun;
  const rows = [
    ["Signature Prompt", f.signaturePrompt, "📝"],
    ["Biggest Rabbit Hole", f.biggestRabbitHole, "🐇"],
    ["Wildest Question", f.wildestQuestion, "🤯"],
    ["Most Creative Moment", f.mostCreativeMoment, "🎨"],
    ["Funniest Insight", f.funniestInsight, "😄"],
  ];
  return (
    <CardShell accent="from-fuchsia-600/35 via-pink-600/20 to-transparent">
      <CardLabel>Fun Facts</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        The <span className="text-gradient">fun</span> stuff
      </h2>
      <div className="mt-8 space-y-3">
        {rows.map(([label, value, emoji], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="glass rounded-2xl p-4 flex gap-4"
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-0.5 font-medium leading-snug">{value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

export function AchievementsCard({ analysis }: { analysis: Analysis }) {
  return (
    <CardShell accent="from-amber-500/30 via-orange-600/20 to-transparent">
      <CardLabel>Achievements Unlocked</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your <span className="text-gradient">badges</span>
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {analysis.achievements.map((a, i) => (
          <motion.div
            key={a}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-500/15 to-orange-600/10 p-5 text-center"
          >
            <div className="text-3xl">🏅</div>
            <div className="mt-2 font-semibold text-sm leading-tight">{a}</div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

export function CareerCard({ analysis }: { analysis: Analysis }) {
  const c = analysis.career;
  const p = analysis.productivity;
  return (
    <CardShell accent="from-cyan-500/30 via-sky-600/20 to-transparent">
      <CardLabel>Career Match</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Built for <span className="text-gradient">this</span>
      </h2>
      <div className="mt-8 space-y-3">
        {[
          [c.topMatch, "🥇"],
          [c.secondMatch, "🥈"],
          [c.thirdMatch, "🥉"],
        ].map(([career, medal], i) => (
          <motion.div
            key={career}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex items-center gap-4 glass rounded-2xl p-4"
          >
            <span className="text-2xl">{medal}</span>
            <span className="font-display text-lg font-bold">{career}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Hours Saved</div>
          <div className="mt-1 font-display text-lg font-bold">{p.estimatedHoursSaved}</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Most Common Use</div>
          <div className="mt-1 font-display text-lg font-bold leading-tight">{p.mostCommonUse}</div>
        </div>
      </div>
    </CardShell>
  );
}

export function PredictionsCard({ analysis }: { analysis: Analysis }) {
  const pr = analysis.prediction;
  const rows = [
    ["Next Skill", pr.nextSkill, "🚀"],
    ["Next Challenge", pr.nextChallenge, "🎯"],
    ["Book for You", pr.bookRecommendation, "📚"],
    ["Project Idea", pr.projectRecommendation, "🛠️"],
    ["Learning Path", pr.learningRecommendation, "🧭"],
  ];
  return (
    <CardShell accent="from-violet-600/35 via-fuchsia-600/20 to-transparent">
      <CardLabel>Looking Ahead</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your <span className="text-gradient">future</span>
      </h2>
      <div className="mt-8 space-y-3">
        {rows.map(([label, value, emoji], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="glass rounded-2xl p-4 flex gap-4"
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-0.5 font-medium leading-snug">{value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}
