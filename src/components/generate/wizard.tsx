"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWizard } from "@/store/wizard";
import { AI_OPTIONS, ENGINEERED_PROMPT } from "@/lib/analysis/prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, ArrowRight, Copy, Check, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { WRAPPED_FEATURE_NAME } from "@/lib/brand";

const LOADING_MESSAGES = [
  "Analyzing personality...",
  "Understanding thinking style...",
  "Finding your strengths...",
  "Calculating creativity...",
  "Measuring curiosity...",
  "Decoding your language habits...",
  "Matching careers...",
  "Building your Wrapped...",
];

function StepShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span className="size-6 grid place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
          {step}
        </span>
        <span>Step {step} of 4</span>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function StepUsername() {
  const { username, setUsername, setStep } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const next = () => {
    const trimmed = username.trim();
    if (!trimmed) return setError("Username is required.");
    if (trimmed.length > 30) return setError("Maximum 30 characters.");
    setUsername(trimmed);
    setError(null);
    setStep(1);
  };

  return (
    <StepShell
      step={1}
      title="What should we call you?"
      subtitle="Just a display name — no account, no email, no password."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="e.g. Alite"
            value={username}
            maxLength={30}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && next()}
            autoFocus
            className="text-lg h-12"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-destructive">{error ?? "\u00A0"}</span>
            <span>{username.length}/30</span>
          </div>
        </div>
        <Button
          onClick={next}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
        >
          Continue <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </StepShell>
  );
}

function StepAI() {
  const { username, aiUsed, setAiUsed, setStep } = useWizard();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selected = AI_OPTIONS.find((ai) => ai.value === aiUsed);
  return (
    <StepShell
      step={2}
      title="Which AI do you use?"
      subtitle="Choose the assistant you asked to profile you."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AI_OPTIONS.map((ai) => (
          <button
            key={ai.value}
            onClick={() => setAiUsed(ai.value)}
            className={cn(
              "glass rounded-2xl p-4 text-left transition-all hover:bg-black/5 dark:hover:bg-white/[0.08] border",
              aiUsed === ai.value
                ? "border-fuchsia-400/70 bg-fuchsia-500/15 ring-2 ring-fuchsia-400/40"
                : "border-black/10 dark:border-white/10"
            )}
          >
            <div className="text-2xl">{ai.emoji}</div>
            <div className="mt-2 font-semibold text-sm leading-tight">{ai.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{ai.description}</div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)} className="h-12 px-5">
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
        <Button
          disabled={!aiUsed}
          onClick={() => setConfirmOpen(true)}
          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
        >
          Continue <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selected?.emoji ?? "🤖"}</span>
              Confirm your choice
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
<p>
                <span className="font-semibold text-foreground">{username}</span>, we&apos;ll analyze{" "}
                <span className="font-semibold text-foreground">{aiUsed}</span>
                &apos;s profile of you.
              </p>
              <p className="text-sm">Is {aiUsed} the AI you want to use?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Go back
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                setStep(2);
              }}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              Yes, it&apos;s {aiUsed} — Confirm <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StepShell>
  );
}

function StepPrompt() {
  const { aiUsed, setStep } = useWizard();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ENGINEERED_PROMPT);
      setCopied(true);
      toast.success("Prompt copied — now paste it into your AI");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy automatically. Select the text manually.");
    }
  };

  return (
    <StepShell
      step={3}
      title="Send this prompt to your AI"
      subtitle={`Paste it into ${aiUsed} (or any AI), wait for its answer, then come back and paste the response.`}
    >
      <div className="glass rounded-2xl p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Your magic prompt
          </span>
          <Button size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="mr-1.5 size-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="mr-1.5 size-4" />}
            {copied ? "Copied!" : "Copy Prompt"}
          </Button>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-72 overflow-y-auto pr-2">
          {ENGINEERED_PROMPT}
        </p>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-5">
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
        >
          I got the answer <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </StepShell>
  );
}

function StepResponse() {
  const { response, setResponse, setStep } = useWizard();
  const MIN = 100;
  const count = response.trim().length;

  return (
    <StepShell
      step={4}
      title="Paste your AI's response"
      subtitle="Copy everything your AI wrote back and paste it below."
    >
      <div className="space-y-4">
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Paste the AI's response here..."
          rows={10}
          maxLength={40000}
          className="text-sm leading-relaxed resize-y min-h-52"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={count >= MIN ? "text-emerald-600 dark:text-emerald-400" : ""}>
            {count < MIN
              ? `Add at least ${MIN - count} more characters`
              : "Looks good! Ready to analyze."}
          </span>
          <span>{count.toLocaleString()}/40,000</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-5">
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
          <Button
            disabled={count < MIN}
            onClick={() => setStep(4)}
            className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-400"
          >
            <Sparkles className="mr-2 size-4" /> Generate My {WRAPPED_FEATURE_NAME}
          </Button>
        </div>
      </div>
    </StepShell>
  );
}

function StepGenerating() {
  const [index, setIndex] = useState(0);
  const { reset } = useWizard();

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto text-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mx-auto size-24 rounded-full border-4 border-black/10 dark:border-white/10 border-t-fuchsia-500 border-r-violet-500"
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-8 font-display text-2xl font-semibold"
        >
          {LOADING_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
      <p className="mt-3 text-sm text-muted-foreground">
        Our AI is reading what your AI said about you...
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-10 text-muted-foreground"
        onClick={() => reset()}
      >
        <RefreshCw className="mr-2 size-3.5" /> Cancel
      </Button>
    </div>
  );
}

export default function GenerateClient() {
  const step = useWizard((s) => s.step);
  const generating = useWizard((s) => s.generating);
  const { username, aiUsed, response, setGenerating, setStep, reset } = useWizard();
  const router = useRouter();

  const generate = useCallback(async () => {
    setGenerating(true);
    setStep(4);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, aiUsed, response }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        setGenerating(false);
        setStep(3);
        return;
      }
      toast.success("Your Wrapped is ready!");
      reset();
      router.push(data.url);
    } catch {
      toast.error("Network error — check your connection and try again.");
      setGenerating(false);
      setStep(3);
    }
  }, [username, aiUsed, response, setGenerating, setStep, reset, router]);

  useEffect(() => {
    if (step === 4 && !generating) {
      generate();
    }
  }, [step, generating, generate]);

  return (
    <main className="relative flex-1 px-4 pt-28 pb-16 min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-violet-400/30 dark:bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 size-96 rounded-full bg-cyan-400/25 dark:bg-cyan-500/10 blur-[120px]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Generate your <span className="text-gradient">{WRAPPED_FEATURE_NAME}</span>
          </h1>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500" : "w-3 bg-black/15 dark:bg-white/15"
                )}
              />
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {generating ? (
              <StepGenerating />
            ) : (
              <>
                {step === 0 && <StepUsername />}
                {step === 1 && <StepAI />}
                {step === 2 && <StepPrompt />}
                {step === 3 && <StepResponse />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-14 flex flex-col items-center gap-1 text-sm text-muted-foreground">
          <span>
            Built by <span className="font-semibold text-foreground">Alite</span> ·{" "}
            <a
              href="https://wa.me/2349154681851?text=Well%20done%20on%20AI%20Wrapped%2C%20Alite!"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              Say hi on WhatsApp 💬
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}
