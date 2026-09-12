"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, TrendingUp, BarChart3, AlertTriangle, Shield, Download, Trash2, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/finsight/processor";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface FinSightLandingProps {
  statements: Array<{
    id: string;
    accountName?: string | null;
    accountNumberMasked?: string | null;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    totalCredit: number | null;
    totalDebit: number | null;
    closingBalance: number | null;
    uploadedAt: Date;
    uploadedFilename?: string | null;
    status: string;
    _count: { transactions: number };
  }>;
}

const FEATURES = [
  { icon: BarChart3, title: "Executive Dashboard", desc: "Health score, summary cards, key metrics at a glance", href: "" },
  { icon: TrendingUp, title: "Cash Flow Analysis", desc: "Monthly money in/out, net flow trends, transaction volume", href: "cashflow" },
  { icon: AlertTriangle, title: "Smart Insights", desc: "Patterns, anomalies, recurring transactions, concentration alerts", href: "insights" },
  { icon: Shield, title: "Risk Assessment", desc: "Liquidity, spending, consistency, anomaly scores with recommendations", href: "risk" },
];

export function FinSightLanding({ statements }: FinSightLandingProps) {
  return (
    <main className="relative flex-1 min-h-screen px-4 pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-emerald-400/25 dark:bg-emerald-600/15 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 size-96 rounded-full bg-teal-400/25 dark:bg-teal-600/15 blur-[120px]" />
      </div>

      <div className="absolute top-6 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 block">
            ← Back to Aura
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/10 mb-4">
                📊 FinSight
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Financial Statement Intelligence
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
                Upload your bank statement (Excel) and get automated analysis: cash flow,
                spending breakdown, pattern detection, risk scoring, and actionable recommendations.
              </p>
            </div>
            <Link
              href="/finsight/upload"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white hover:scale-[1.03] active:scale-95 transition-transform glow-primary"
            >
              <Plus className="size-5" /> Upload Statement
            </Link>
          </div>
        </div>



        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-center">What You Get</h2>
          <p className="mt-2 text-center text-muted-foreground max-w-xl mx-auto">
            Every analysis includes six comprehensive screens powered by deterministic
            calculations and AI explanations.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-3xl p-6 h-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="size-12 grid place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-2xl">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureLink({ statementId, feature, label }: { statementId: string; feature: typeof FEATURES[0]; label: string }) {
  const href = feature.href ? `/finsight/${statementId}/${feature.href}` : `/finsight/${statementId}`;
  return (
    <Link
      href={href}
      className="text-center rounded-xl p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
    >
      <feature.icon className="mx-auto size-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
      <p className="mt-1.5 text-sm font-medium">{label}</p>
    </Link>
  );
}





