"use client";

import { Shield, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Lightbulb, Target, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskPageProps {
  statement: {
    riskScore: {
      overallScore: { toNumber(): number };
      liquidityScore: { toNumber(): number };
      spendingScore: { toNumber(): number };
      consistencyScore: { toNumber(): number };
      anomalyScore: { toNumber(): number };
      concentrationScore: { toNumber(): number };
    } | null;
    insights: Array<{
      type: string;
      severity: string;
      title: string;
      observation: string;
      explanation?: string | null;
      recommendation?: string | null;
    }>;
    monthlyMetrics: Array<{
      month: Date;
      totalCredit: { toNumber(): number } | null;
      totalDebit: { toNumber(): number } | null;
      netFlow: { toNumber(): number } | null;
      endingBalance?: { toNumber(): number } | null;
    }>;
    transactions: Array<{
      description: string;
      debit: { toNumber(): number };
      credit: { toNumber(): number };
      category?: string | null;
    }>;
  };
}

const RISK_FACTORS = [
  { key: "liquidityScore", label: "Liquidity", weight: "25%", description: "Ability to cover short-term needs from available balance", icon: HelpCircle },
  { key: "spendingScore", label: "Spending Concentration", weight: "20%", description: "Diversity of outflow categories — lower = more concentrated", icon: Target },
  { key: "consistencyScore", label: "Cash-Flow Consistency", weight: "20%", description: "Month-to-month stability of inflows and outflows", icon: TrendingUp },
  { key: "anomalyScore", label: "Transaction Anomalies", weight: "15%", description: "Presence of statistically unusual transactions", icon: AlertCircle },
  { key: "concentrationScore", label: "Balance Retention", weight: "10%", description: "Proportion of inflows retained vs immediately spent", icon: HelpCircle },
] as const;

function getScoreConfig(score: number) {
  if (score >= 70) return { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/15", label: "Strong", icon: CheckCircle };
  if (score >= 40) return { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15", label: "Moderate", icon: AlertCircle };
  return { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/15", label: "Weak", icon: AlertCircle };
}

function calculateImprovements(statement: RiskPageProps["statement"]) {
  const improvements: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  const monthly = statement.monthlyMetrics;
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const prevIn = prev.totalCredit?.toNumber() || 0;
    const lastIn = last.totalCredit?.toNumber() || 0;
    const prevOut = prev.totalDebit?.toNumber() || 0;
    const lastOut = last.totalDebit?.toNumber() || 0;
    const prevNet = prev.netFlow?.toNumber() || 0;
    const lastNet = last.netFlow?.toNumber() || 0;
    
    const inflowChange = prevIn > 0 ? ((lastIn - prevIn) / prevIn) * 100 : 0;
    const outflowChange = prevOut > 0 ? ((lastOut - prevOut) / prevOut) * 100 : 0;
    const netChange = prevNet !== 0 ? ((lastNet - prevNet) / Math.abs(prevNet)) * 100 : 0;

    if (outflowChange < -10) {
      improvements.push(`Monthly outflow decreased by ${Math.abs(outflowChange).toFixed(0)}% compared to the previous month.`);
    } else if (outflowChange > 15) {
      concerns.push(`Monthly outflow increased by ${outflowChange.toFixed(0)}% compared to the previous month.`);
    }
    if (inflowChange > 10) {
      improvements.push(`Monthly inflow increased by ${inflowChange.toFixed(0)}% compared to the previous month.`);
    } else if (inflowChange < -15) {
      concerns.push(`Monthly inflow decreased by ${Math.abs(inflowChange).toFixed(0)}% compared to the previous month.`);
    }
    if (netChange > 20) {
      improvements.push(`Net cash flow improved by ${netChange.toFixed(0)}% month-over-month.`);
    } else if (netChange < -20) {
      concerns.push(`Net cash flow declined by ${Math.abs(netChange).toFixed(0)}% month-over-month.`);
    }
  }

  const totalDebit = statement.transactions.reduce((s, t) => s + t.debit.toNumber(), 0);
  const categoryMap = new Map<string, number>();
  for (const tx of statement.transactions) {
    const cat = tx.category || "Other";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.debit.toNumber());
  }
  const topCat = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topCat && totalDebit > 0) {
    const pct = (topCat[1] / totalDebit) * 100;
    if (pct > 50) {
      concerns.push(`${topCat[0]} represents ${pct.toFixed(0)}% of total outflows (₦${topCat[1].toLocaleString()}).`);
    }
  }

  const risk = statement.riskScore;
  if (risk) {
    if (risk.liquidityScore.toNumber() < 40) {
      concerns.push("Low liquidity — closing balance covers less than one month of average inflows.");
    }
    if (risk.anomalyScore.toNumber() < 60) {
      concerns.push("Multiple statistically unusual transactions detected requiring review.");
    }
    if (risk.consistencyScore.toNumber() < 40) {
      concerns.push("Cash flow shows high month-to-month volatility.");
    }
  }

  const closingBalance = statement.monthlyMetrics[statement.monthlyMetrics.length - 1]?.endingBalance?.toNumber() || 0;
  const totalIn = statement.transactions.reduce((s, t) => s + t.credit.toNumber(), 0);
  if (totalIn > 0 && closingBalance / totalIn < 0.1) {
    concerns.push("Ending balances remain low relative to the volume of financial activity.");
  }

  if (concerns.length > 0) {
    recommendations.push("Maintain a defined cash reserve of at least one month's average outflow.");
    recommendations.push("Review recurring payments and subscriptions for potential savings.");
    recommendations.push("Track high-value transfers and verify they are authorized.");
    recommendations.push("Separate personal and business transactions into different accounts.");
    recommendations.push("Review unusual transactions flagged in the Insights section manually.");
  } else {
    recommendations.push("Continue monitoring monthly cash flow trends.");
    recommendations.push("Consider setting up automated savings from each inflow.");
    recommendations.push("Periodically review category spending for optimization opportunities.");
  }

  return { improvements, concerns, recommendations };
}

export function RiskPage({ statement }: RiskPageProps) {
  const risk = statement.riskScore;
  const overallScore = risk?.overallScore.toNumber() || 0;
  const { improvements, concerns, recommendations } = calculateImprovements(statement);
  const overallConfig = getScoreConfig(overallScore);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Risk & Recommendations</h1>
        <p className="mt-1 text-muted-foreground">
          Analytical risk assessment based on liquidity, spending patterns, consistency, and anomalies.
          This is not a credit score — it&apos;s a financial activity health indicator.
        </p>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-semibold text-lg">Risk Assessment</h2>
        <div className="mt-6 flex items-center gap-8">
          <div className="relative size-48 flex-shrink-0">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted-foreground/10 dark:text-white/5" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={cn("stroke-current", overallConfig.color)}
                style={{ strokeDasharray: 339, strokeDashoffset: 339 - (339 * overallScore) / 100 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl md:text-7xl font-bold" style={{ color: `var(--tw-text-opacity)` }}>
                {Math.round(overallScore)}
              </span>
              <span className="text-sm font-medium mt-1" style={{ color: `var(--tw-text-opacity)` }}>
                /100
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("font-semibold text-2xl", overallConfig.color)}>
              <overallConfig.icon className="inline size-6 mr-2" /> {overallConfig.label}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Financial Activity Health Score — an analytical indicator combining liquidity,
              spending concentration, cash-flow stability, transaction anomalies, and balance retention.
              <strong className="text-foreground"> Not a regulated credit or banking score.</strong>
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {RISK_FACTORS.map((factor) => {
                const score = risk?.[factor.key as keyof typeof risk]?.toNumber() || 0;
                const config = getScoreConfig(score);
                return (
                  <span
                    key={factor.key}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium",
                      config.bg,
                      config.color
                    )}
                    title={`${factor.description} (Weight: ${factor.weight})`}
                  >
                    <config.icon className="size-3" />
                    {factor.label}: {Math.round(score)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {risk && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RISK_FACTORS.map((factor) => {
              const score = risk[factor.key as keyof typeof risk]?.toNumber() || 0;
              const config = getScoreConfig(score);
              return (
                <div key={factor.key} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{factor.label}</span>
                    <span className={cn("font-bold text-lg", config.color)}>{Math.round(score)}</span>
                  </div>
                  <div className="mt-2 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${score}%`,
                        backgroundColor: config.color.replace("text-", "").replace("dark:text-", ""),
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">{factor.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-500" />
            <h2 className="font-semibold text-lg">What&apos;s Improving</h2>
          </div>
          <div className="mt-4 space-y-3">
            {improvements.length > 0 ? (
              improvements.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No significant improvements detected in the most recent period.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-rose-500" />
            <h2 className="font-semibold text-lg">What Needs Attention</h2>
          </div>
          <div className="mt-4 space-y-3">
            {concerns.length > 0 ? (
              concerns.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 dark:text-rose-300">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No major concerns detected. Good job!</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-500" />
          <h2 className="font-semibold text-lg">Recommended Actions</h2>
        </div>
        <div className="mt-4 space-y-3">
          {recommendations.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Lightbulb className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-semibold text-lg">Methodology Notes</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Scores are analytical indicators derived from your transaction data only.</li>
          <li>Liquidity: closing balance relative to average monthly inflow.</li>
          <li>Spending Concentration: inverse of top-category share of outflows.</li>
          <li>Consistency: inverse of coefficient of variation in monthly net flow.</li>
          <li>Anomalies: based on 3-standard-deviation threshold on debit amounts.</li>
          <li>Balance Retention: closing balance as percentage of total inflows.</li>
          <li>Overall score weights: Liquidity 25%, Spending 20%, Consistency 20%, Anomalies 15%, Retention 10%, Recurring 10%.</li>
          <li>No external data sources or credit bureau information is used.</li>
        </ul>
      </div>
    </div>
  );
}