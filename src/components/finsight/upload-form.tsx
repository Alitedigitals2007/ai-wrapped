"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "reading", label: "Reading workbook", icon: "📄" },
  { key: "detecting", label: "Detecting transaction sheets", icon: "🔍" },
  { key: "cleaning", label: "Cleaning transactions", icon: "🧹" },
  { key: "categorizing", label: "Categorizing transactions", icon: "🏷️" },
  { key: "patterns", label: "Detecting patterns", icon: "📊" },
  { key: "risk", label: "Calculating risk", icon: "⚖️" },
  { key: "report", label: "Generating report", icon: "📋" },
];

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const validateFile = (f: File): string | null => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(f.type)) return "Please upload .xlsx or .xls files only.";
    if (f.size > 10 * 1024 * 1024) return "File too large. Maximum size is 10MB.";
    return null;
  };

  const simulateProgress = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a file first.");
    
    const validationError = validateFile(file);
    if (validationError) return setError(validationError);
    
    setUploading(true);
    setError(null);
    setCurrentStep(0);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const progressPromise = simulateProgress();
      
      const res = await fetch("/api/finsight/upload", {
        method: "POST",
        body: formData,
      });
      
      await progressPromise;
      setCurrentStep(STEPS.length);
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      
      setTimeout(() => {
        router.push(`/finsight/${data.statementId}`);
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
      setCurrentStep(0);
    }
  };

  const reset = () => {
    setFile(null);
    setUploading(false);
    setCurrentStep(0);
    setError(null);
  };

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-emerald-400/25 dark:bg-emerald-600/15 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 size-96 rounded-full bg-teal-400/25 dark:bg-teal-600/15 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/finsight" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 block">
            ← Back to FinSight
          </Link>
          <div className="mx-auto size-20 grid place-items-center rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 text-4xl text-white shadow-2xl shadow-emerald-500/30">
            📊
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Upload Statement
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Drop your bank statement (Excel) and get a full financial analysis with
            cash flow, spending breakdown, patterns, and risk assessment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-3xl border-2 border-dashed p-10 text-center transition-all",
              dragActive
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-border/50 hover:border-emerald-400/50"
            )}
          >
            <input
              type="file"
              id="statement-file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <label htmlFor="statement-file" className="cursor-pointer">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mx-auto size-24 grid place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-4xl"
              >
                <Upload className="size-12 text-emerald-500" />
              </motion.div>
              <p className="mt-5 text-lg font-medium">Drop Excel file here or click to browse</p>
              <p className="mt-2 text-sm text-muted-foreground">.xlsx, .xls · Up to 10MB</p>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 glass rounded-xl p-3 text-left"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <FileCheck className="size-5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove file"
                    >
                      <XCircle className="size-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </label>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3"
            >
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!uploading && file && (
              <motion.button
                key="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                type="submit"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-400 shadow-xl shadow-emerald-500/20"
              >
                Analyze Statement
              </motion.button>
            )}

            {uploading && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Analyzing your statement…</span>
                    <Loader2 className="size-5 text-emerald-500 animate-spin" />
                  </div>
                  <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {STEPS.map((step, i) => (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 text-sm px-2 py-1.5 rounded-xl transition-colors",
                        i < currentStep
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : i === currentStep
                          ? "bg-black/5 dark:bg-white/5 text-foreground"
                          : "text-muted-foreground/50"
                      )}
                    >
                      <span className="text-xl">{step.icon}</span>
                      <span className="flex-1">{step.label}</span>
                      {i < currentStep && <CheckCircle className="size-5 text-emerald-500 shrink-0" />}
                      {i === currentStep && <Loader2 className="size-5 text-emerald-500 animate-spin shrink-0" />}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground/60">
            Your data is processed securely and never shared. No account required.
          </p>
        </form>
      </div>
    </main>
  );
}