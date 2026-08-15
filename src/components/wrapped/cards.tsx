"use client";

import { motion } from "framer-motion";
import type { Analysis } from "@/lib/analysis/types";
import { SCORE_KEYS } from "@/lib/analysis/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WRAPPED_FEATURE_NAME } from "@/lib/brand";

type CardTheme = {
  bg: string;
  orb: string;
  orb2: string;
};

const THEMES: Record<string, CardTheme> = {
  welcome: {
    bg: "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500",
    orb: "bg-white/25",
    orb2: "bg-cyan-300/40",
  },
  personality: {
    bg: "bg-gradient-to-br from-fuchsia-600 via-pink-600 to-rose-500",
    orb: "bg-white/25",
    orb2: "bg-amber-300/30",
  },
  thinking: {
    bg: "bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-600",
    orb: "bg-white/25",
    orb2: "bg-fuchsia-300/30",
  },
  scores: {
    bg: "bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-600",
    orb: "bg-white/25",
    orb2: "bg-cyan-300/30",
  },
  communication: {
    bg: "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600",
    orb: "bg-white/25",
    orb2: "bg-amber-300/30",
  },
  interests: {
    bg: "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600",
    orb: "bg-white/25",
    orb2: "bg-violet-300/30",
  },
  strengths: {
    bg: "bg-gradient-to-br from-teal-600 via-emerald-600 to-lime-600",
    orb: "bg-white/25",
    orb2: "bg-cyan-300/30",
  },
  fun: {
    bg: "bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-600",
    orb: "bg-white/25",
    orb2: "bg-cyan-300/30",
  },
  achievements: {
    bg: "bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-500",
    orb: "bg-white/25",
    orb2: "bg-rose-300/30",
  },
  career: {
    bg: "bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700",
    orb: "bg-white/25",
    orb2: "bg-emerald-300/30",
  },
  predictions: {
    bg: "bg-gradient-to-br from-purple-700 via-violet-600 to-fuchsia-600",
    orb: "bg-white/25",
    orb2: "bg-cyan-300/30",
  },
  share: {
    bg: "bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-500",
    orb: "bg-white/25",
    orb2: "bg-amber-300/30",
  },
};

export function CardShell({
  children,
  theme = "welcome",
  className,
}: {
  children: React.ReactNode;
  theme?: string;
  className?: string;
}) {
  const t = THEMES[theme] ?? THEMES.welcome;
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[2rem] text-white shadow-2xl shadow-black/40",
        t.bg,
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute -top-24 -right-24 size-80 rounded-full blur-[90px]",
          t.orb
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute -bottom-28 -left-20 size-72 rounded-full blur-[90px]",
          t.orb2
        )}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/40"
      />
      <div className="relative h-full flex flex-col p-8 md:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold">
      {children}
    </div>
  );
}

function Tile({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function TileLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-white/55">
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
            i <= value ? "bg-gradient-to-r from-white to-cyan-100" : "bg-white/25"
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
    <CardShell theme="welcome">
      <div className="my-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto size-24 grid place-items-center rounded-3xl bg-white/15 backdrop-blur-sm text-5xl shadow-2xl shadow-black/30 border border-white/30"
        >
          {aiEmoji}
        </motion.div>
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-white/60">{WRAPPED_FEATURE_NAME} presents</p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight text-gradient-bright">
          {username}
        </h1>
        <p className="mt-4 text-white/70">
          Powered by {aiUsed} · {date}
        </p>
      </div>
    </CardShell>
  );
}

export function PersonalityCard({ analysis }: { analysis: Analysis }) {
  const p = analysis.personality;
  return (
    <CardShell theme="personality">
      <CardLabel>Your Personality</CardLabel>
      <div className="mt-2">
        <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          The <span className="text-gradient-bright">{p.personalityType}</span>
        </h2>
        <p className="mt-2 text-white/70">AI Archetype: {p.aiArchetype}</p>
      </div>
      <div className="mt-auto space-y-5 pt-8">
        {[
          ["Confidence", p.confidenceLevel],
          ["Curiosity", p.curiosityLevel],
          ["Creativity", p.creativityLevel],
        ].map(([label, level]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-white/60">{label}</span>
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
    <CardShell theme="thinking">
      <CardLabel>How You Think</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your thinking <span className="text-gradient-bright">style</span>
      </h2>
      <div className="mt-8 grid gap-3">
        {rows.map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm"
          >
            <div className="text-xs uppercase tracking-wider text-white/55">{label}</div>
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
    <CardShell theme="scores">
      <CardLabel>Your Scores</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Out of <span className="text-gradient-bright">100</span>
      </h2>
      <div className="mt-8 space-y-4">
        {SCORE_KEYS.map((s, i) => (
          <div key={s.key}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/60">{s.label}</span>
              <span className="font-semibold">{scores[s.key]}</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white to-cyan-200"
                initial={{ width: 0 }}
                animate={{ width: `${scores[s.key]}%` }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between rounded-2xl border border-white/25 bg-black/30 p-5 backdrop-blur-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/70">Overall Score</div>
          <div className="font-display text-2xl font-bold">AI Power Level</div>
        </div>
        <div className="font-display text-6xl font-bold text-gradient-bright">{scores.overall}</div>
      </div>
    </CardShell>
  );
}

export function CommunicationCard({ analysis }: { analysis: Analysis }) {
  const l = analysis.language;
  return (
    <CardShell theme="communication">
      <CardLabel>How You Talk to AI</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your voice<span className="text-gradient-bright">print</span>
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
            className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <TileLabel>{label}</TileLabel>
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
    <CardShell theme="interests">
      <CardLabel>Your Interests</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        What you&apos;re <span className="text-gradient-bright">into</span>
      </h2>
      <div className="mt-8">
        <div className="text-xs uppercase tracking-wider text-white/55 mb-3">Top Topics</div>
        <div className="flex flex-wrap gap-2">
          {interests.topTopics.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="rounded-full border border-white/30 bg-white/15 px-4 py-2 font-semibold backdrop-blur-sm"
            >
              {t}
            </motion.span>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Tile className="p-5">
            <TileLabel>Favorite Domain</TileLabel>
            <div className="mt-1 font-display text-xl font-bold">{interests.favoriteDomain}</div>
          </Tile>
          <Tile className="p-5">
            <TileLabel>Most Discussed</TileLabel>
            <div className="mt-1 font-display text-xl font-bold">{interests.mostDiscussedArea}</div>
          </Tile>
        </div>
      </div>
    </CardShell>
  );
}

export function StrengthsCard({ analysis }: { analysis: Analysis }) {
  return (
    <CardShell theme="strengths">
      <CardLabel>Your Strengths</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        What makes you <span className="text-gradient-bright">great</span>
      </h2>
      <div className="mt-8 space-y-3">
        {analysis.strengths.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <span className="font-display text-2xl font-bold text-white/30">{i + 1}</span>
            <span className="font-semibold text-lg">{s}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8">
        <div className="text-xs uppercase tracking-wider text-white/55 mb-3">Growth Areas</div>
        <div className="flex flex-wrap gap-2">
          {analysis.improvement.map((imp) => (
            <Badge
              key={imp}
              className="border-white/25 bg-white/15 text-white px-3 py-1.5"
            >
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
    <CardShell theme="fun">
      <CardLabel>Fun Facts</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        The <span className="text-gradient-bright">fun</span> stuff
      </h2>
      <div className="mt-8 space-y-3">
        {rows.map(([label, value, emoji], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <TileLabel>{label}</TileLabel>
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
    <CardShell theme="achievements">
      <CardLabel>Achievements Unlocked</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your <span className="text-gradient-bright">badges</span>
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {analysis.achievements.map((a, i) => (
          <motion.div
            key={a}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="rounded-2xl border border-white/30 bg-white/10 p-5 text-center backdrop-blur-sm"
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
    <CardShell theme="career">
      <CardLabel>Career Match</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Built for <span className="text-gradient-bright">this</span>
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
            className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <span className="text-2xl">{medal}</span>
            <span className="font-display text-lg font-bold">{career}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <Tile className="p-4">
          <TileLabel>Hours Saved</TileLabel>
          <div className="mt-1 font-display text-lg font-bold">{p.estimatedHoursSaved}</div>
        </Tile>
        <Tile className="p-4">
          <TileLabel>Most Common Use</TileLabel>
          <div className="mt-1 font-display text-lg font-bold leading-tight">{p.mostCommonUse}</div>
        </Tile>
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
    <CardShell theme="predictions">
      <CardLabel>Looking Ahead</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your <span className="text-gradient-bright">future</span>
      </h2>
      <div className="mt-8 space-y-3">
        {rows.map(([label, value, emoji], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <TileLabel>{label}</TileLabel>
              <div className="mt-0.5 font-medium leading-snug">{value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}
