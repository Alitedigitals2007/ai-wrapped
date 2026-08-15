"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toPng, toBlob } from "html-to-image";
import { toast } from "sonner";
import type { PersonalityReport } from "@/lib/personality/types";
import { CardShell, CardLabel } from "@/components/wrapped/cards";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Swords,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  code: string | null;
  name: string;
  report: PersonalityReport;
  engine: string | null;
}

const CARD_TITLES = [
  "Welcome",
  "Your Personality",
  "Dimensions",
  "Strengths",
  "Blind Spot",
  "Your Styles",
  "Career Directions",
  "Fun Fact",
  "Your Report Card",
];

function EngineBadge({ engine }: { engine: string | null }) {
  if (engine === "groq")
    return (
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/60">
        ⚡ Report written with Groq
      </p>
    );
  if (engine === "openai")
    return (
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/60">
        ✦ Report written with OpenAI
      </p>
    );
  return (
    <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/60">
      ⚙️ Built with our local analyzer
    </p>
  );
}

function WelcomeCard({ name, report }: { name: string; report: PersonalityReport }) {
  return (
    <CardShell theme="welcome">
      <div className="my-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto size-24 grid place-items-center rounded-3xl bg-white/15 backdrop-blur-sm text-5xl shadow-2xl shadow-black/30 border border-white/30"
        >
          🧠
        </motion.div>
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-white/60">
          Personality Report presents
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tight text-gradient-bright">
          {name}
        </h1>
        <p className="mt-4 text-white/70">{report.archetype}</p>
      </div>
    </CardShell>
  );
}

function PersonalityCard({ report }: { report: PersonalityReport }) {
  return (
    <CardShell theme="personality">
      <CardLabel>Your Personality</CardLabel>
      <div className="mt-2">
        <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          The <span className="text-gradient-bright">{report.archetype}</span>
        </h2>
        <p className="mt-3 text-white/70 italic">“{report.tagline}”</p>
      </div>
      <p className="mt-auto pt-8 text-white/85 leading-relaxed">{report.summary}</p>
    </CardShell>
  );
}

function DimensionsCard({ report }: { report: PersonalityReport }) {
  const top = report.highlights.slice(0, 6);
  return (
    <CardShell theme="scores">
      <CardLabel>Your Dimension Scores</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Measured across <span className="text-gradient-bright">15 traits</span>
      </h2>
      <div className="mt-8 space-y-4">
        {top.map((h, i) => (
          <div key={h.key}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/60">
                {h.emoji} {h.label}
              </span>
              <span className="font-semibold">{h.score}</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white to-cyan-200"
                initial={{ width: 0 }}
                animate={{ width: `${h.score}%` }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-white/55 leading-relaxed">
        {report.highlights[0]?.description}
      </p>
    </CardShell>
  );
}

function StrengthsCard({ report }: { report: PersonalityReport }) {
  return (
    <CardShell theme="strengths">
      <CardLabel>Strengths & Growth</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your <span className="text-gradient-bright">edge</span>
      </h2>
      <div className="mt-8 space-y-3">
        {report.strengths.map((s, i) => (
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
          {report.growthAreas.map((g) => (
            <span
              key={g}
              className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-sm"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function BlindSpotCard({ report }: { report: PersonalityReport }) {
  return (
    <CardShell theme="thinking">
      <CardLabel>Possible Blind Spot</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Worth <span className="text-gradient-bright">noticing</span>
      </h2>
      <div className="mt-auto pt-10 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <p className="text-white/85 text-lg leading-relaxed italic">“{report.blindSpot}”</p>
      </div>
    </CardShell>
  );
}

function StylesCard({ report }: { report: PersonalityReport }) {
  const rows: [string, string][] = [
    ["Social Energy", report.styles.social],
    ["Decision Style", report.styles.decision],
    ["Conflict Style", report.styles.conflict],
    ["What Drives You", report.styles.values],
  ];
  return (
    <CardShell theme="communication">
      <CardLabel>How You Show Up</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Your <span className="text-gradient-bright">styles</span>
      </h2>
      <div className="mt-8 space-y-3">
        {rows.map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <div className="text-xs uppercase tracking-wider text-white/55">{label}</div>
            <div className="mt-1 text-sm font-medium leading-snug text-white/90">{value}</div>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}

function CareersCard({ report }: { report: PersonalityReport }) {
  return (
    <CardShell theme="career">
      <CardLabel>Career Directions</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Built for <span className="text-gradient-bright">this</span>
      </h2>
      <div className="mt-8 space-y-3">
        {report.careers.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.08 }}
            className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <span className="text-2xl">{["🥇", "🥈", "🥉", "🔹", "🔹"][i] ?? "🔹"}</span>
            <span className="font-display text-lg font-bold">{c}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-auto pt-8 text-xs text-white/55">
        Directions are suggestions based on your pattern of answers — not a verdict.
      </p>
    </CardShell>
  );
}

function FunFactCard({ report }: { report: PersonalityReport }) {
  return (
    <CardShell theme="fun">
      <CardLabel>Fun Fact</CardLabel>
      <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">
        Just for <span className="text-gradient-bright">fun</span>
      </h2>
      <div className="mt-auto pt-10">
        <p className="text-white/85 text-xl leading-relaxed">{report.funFact}</p>
      </div>
    </CardShell>
  );
}

function ReportShareCard({
  name,
  report,
  code,
  engine,
}: {
  name: string;
  report: PersonalityReport;
  code: string | null;
  engine: string | null;
}) {
  return (
    <CardShell theme="share">
      <div className="my-auto text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Personality Report</p>
        <h2 className="mt-2 font-display text-5xl md:text-6xl font-bold text-gradient-bright">
          {name}
        </h2>
        <p className="mt-2 text-white/70">{report.archetype}</p>

        {code && (
          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 backdrop-blur-sm">
            <span className="text-white/60">CODE: </span>
            <span className="font-display text-xl font-bold tracking-[0.2em]">{code}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          {report.highlights.slice(0, 4).map((h) => (
            <div
              key={h.key}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
            >
              <div className="text-[11px] uppercase tracking-wider text-white/55">
                {h.emoji} {h.label}
              </div>
              <div className="mt-1 font-display text-2xl font-bold">{h.score}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {report.strengths.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
            >
              {s}
            </span>
          ))}
        </div>

        <EngineBadge engine={engine} />

        <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-white/60">
          Generated by Personality Report
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/50">
          Built by Alite
        </p>
      </div>
    </CardShell>
  );
}

export default function ReportViewer({ code, name, report, engine }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const tapDownRef = useRef<{ x: number; y: number } | null>(null);
  const total = 9;

  const captions = useMemo(() => {
    return [
      `${name}'s Personality Report — discover how you tick 🧠`,
      `My personality archetype: ${report.archetype}`,
      `My top dimension scores: ${report.highlights.slice(0, 3).map((h) => `${h.label} ${h.score}`).join(", ")}`,
      `My top strengths: ${report.strengths.slice(0, 3).join(", ")} 💪`,
      `My blind spot: ${report.blindSpot}`,
      `How I show up: ${report.styles.social}`,
      `Careers that fit me: ${report.careers.slice(0, 3).join(", ")}`,
      `Fun fact: ${report.funFact}`,
      `My personality archetype is ${report.archetype}. Take the test and compare!`,
    ];
  }, [name, report]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const handleTapStart = (e: React.PointerEvent) => {
    tapDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tapDownRef.current) return;
    const dx = Math.abs(e.clientX - tapDownRef.current.x);
    const dy = Math.abs(e.clientY - tapDownRef.current.y);
    tapDownRef.current = null;
    if (dx > 12 || dy > 12) return;
    if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.32) prev();
    else if (x > rect.width * 0.68) next();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const fileName = useMemo(() => {
    const slug = CARD_TITLES[index].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `${name.toLowerCase().replace(/\s+/g, "-")}-${slug}.png`;
  }, [index, name]);

  const downloadPng = async () => {
    if (!cardRef.current) return;
    setBusy("download");
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      toast.success(`Saved ${CARD_TITLES[index]} as PNG!`);
    } catch {
      toast.error("Couldn't render the image. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const shareCard = async () => {
    if (!cardRef.current) return;
    setBusy("share");
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 2, cacheBust: true });
      if (!blob) throw new Error("no blob");
      const file = new File([blob], fileName, { type: "image/png" });
      const caption = captions[index];
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `${name}'s Personality Report`, text: caption });
          return;
        } catch {
          /* user cancelled */
        }
      }
      const link = document.createElement("a");
      link.download = file.name;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      try {
        await navigator.clipboard.writeText(caption);
        toast.success("Image saved + caption copied!");
      } catch {
        toast.success("Image saved!");
      }
    } catch {
      toast.error("Couldn't render the image. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/report/${code}`;
    const text = `${captions[total - 1]} → ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name}'s Personality Report`, text, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Couldn't copy automatically.");
    }
  };

  const startCompare = async () => {
    const fc = friendCode.trim().toUpperCase();
    if (fc.length < 4) return;
    try {
      const res = await fetch(`/api/lookup?code=${encodeURIComponent(fc)}`);
      if (res.status === 404) {
        toast.error(`No report found with code "${fc}". Double-check it.`);
        return;
      }
      if (!res.ok) throw new Error("lookup failed");
      setCompareOpen(false);
      router.push(`/compare?me=${encodeURIComponent(code ?? "")}&them=${encodeURIComponent(fc)}`);
    } catch {
      toast.error("Couldn't reach the compare service.");
    }
  };

  const cards = [
    <WelcomeCard key="w" name={name} report={report} />,
    <PersonalityCard key="p" report={report} />,
    <DimensionsCard key="d" report={report} />,
    <StrengthsCard key="s" report={report} />,
    <BlindSpotCard key="b" report={report} />,
    <StylesCard key="st" report={report} />,
    <CareersCard key="c" report={report} />,
    <FunFactCard key="f" report={report} />,
    <ReportShareCard key="share" name={name} report={report} code={code} engine={engine} />,
  ];

  return (
    <main className="relative flex-1 min-h-screen flex flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 size-[30rem] rounded-full bg-teal-400/30 dark:bg-teal-600/20 blur-[130px] animate-float-slow" />
        <div className="absolute bottom-0 right-0 size-[26rem] rounded-full bg-emerald-400/25 dark:bg-emerald-600/20 blur-[130px] animate-float-slower" />
      </div>

      <header className="fixed top-0 inset-x-0 z-40 px-4 pt-4">
        <div className="mx-auto max-w-5xl glass rounded-full px-4 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-sm shrink-0">
            🧠 Personality Report
          </Link>
          <div className="hidden sm:flex flex-1 justify-center gap-1.5">
            {CARD_TITLES.map((t, i) => (
              <button
                key={t}
                title={t}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400"
                    : "w-2 bg-black/15 dark:bg-white/15 hover:bg-black/30 dark:hover:bg-white/30"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              {index + 1}/{total}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center px-4 pt-20 pb-32">
        <div className="mx-auto w-full max-w-3xl h-[58vh] md:h-[66vh] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 80, rotate: 1.5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -80, rotate: -1.5 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) next();
                else if (info.offset.x > 60) prev();
              }}
              onPointerDown={handleTapStart}
              onClick={handleCardTap}
              className="h-full cursor-grab active:cursor-grabbing touch-pan-y"
            >
              <div ref={cardRef} className="h-full">
                {cards[index]}
              </div>
            </motion.div>
          </AnimatePresence>
          {index === 0 && (
            <div className="pointer-events-none absolute -bottom-8 inset-x-0 text-center text-xs text-muted-foreground/80 md:hidden animate-pulse">
              Swipe or tap the edges to browse →
            </div>
          )}
        </div>

        <div className="fixed bottom-0 inset-x-0 z-40">
          <div className="mx-auto max-w-3xl px-4 pb-5">
            <div className="glass rounded-2xl p-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prev} disabled={index === 0} className="shrink-0">
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex-1 text-center min-w-0">
                {index === total - 1 ? (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Button size="sm" onClick={downloadPng} disabled={busy !== null} className="bg-gradient-to-r from-teal-600 to-emerald-600">
                      <Download className="mr-1.5 size-4" />
                      {busy === "download" ? "Rendering..." : "Download PNG"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={shareLink}>
                      <Share2 className="mr-1.5 size-4" /> Share
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCompareOpen(true)} disabled={!code}>
                      <Swords className="mr-1.5 size-4" /> Compare
                    </Button>
                    <Button size="sm" variant="ghost" render={<Link href="/personality" />}>
                      <RefreshCw className="mr-1.5 size-4" /> Take Again
                    </Button>
                  </div>
                ) : (
                  <div className="min-w-0 px-2">
                    <span className="text-sm text-muted-foreground font-display font-semibold tracking-wide block truncate">
                      {CARD_TITLES[index]}
                    </span>
                    <span className="text-[11px] text-muted-foreground/80 block truncate">
                      {captions[index]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={downloadPng}
                  disabled={busy !== null || index === total - 1}
                  title="Download this card"
                  className="size-8"
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shareCard}
                  disabled={busy !== null || index === total - 1}
                  title="Share this card to apps"
                  className="size-8"
                >
                  <Share2 className="size-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={next} disabled={index === total - 1} className="shrink-0">
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare with a friend 🥊</DialogTitle>
            <DialogDescription>
              Ask your friend for their report code and paste it below. Your code:{" "}
              <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground">
                {code ?? "—"}
              </span>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={friendCode}
            onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
            placeholder="e.g. KC7F2M"
            maxLength={6}
            className="h-12 text-center font-mono text-lg uppercase tracking-[0.3em]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && friendCode.length >= 4) startCompare();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>Cancel</Button>
            <Button
              disabled={friendCode.trim().length < 4}
              onClick={() => startCompare()}
              className="bg-gradient-to-r from-teal-600 to-emerald-600"
            >
              <Swords className="mr-1.5 size-4" /> Compare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}