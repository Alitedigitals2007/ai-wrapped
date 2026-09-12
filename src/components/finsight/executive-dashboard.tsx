"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Download, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/finsight/processor";
import { cn } from "@/lib/utils";

interface ExecutiveDashboardProps {
  statement: {
    id: string;
    accountName?: string | null;
    accountNumberMasked?: string | null;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    openingBalance: number | null;
    closingBalance: number | null;
    totalCredit: number | null;
    totalDebit: number | null;
    creditCount: number | null;
    debitCount: number | null;
    uploadedAt: Date;
    uploadedFilename?: string | null;
    monthlyMetrics: Array<{
      month: Date;
      totalCredit: number | null;
      totalDebit: number | null;
      netFlow: number | null;
      transactionCount: number;
      endingBalance?: number | null;
    }>;
    insights: Array<{
      type: string;
      severity: string;
      title: string;
      observation: string;
      explanation?: string | null;
      recommendation?: string | null;
      confidence: number | null;
    }>;
    riskScore: {
      overallScore: number | null;
      liquidityScore: number | null;
      spendingScore: number | null;
      consistencyScore: number | null;
      anomalyScore: number | null;
      concentrationScore: number | null;
    } | null;
  };
}

function getPeriodText(start?: Date | null, end?: Date | null): string {
  if (!start || !end) return "Statement period";
  return `${new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} — ${new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function getHealthLabel(score: number): { label: string; color: string; icon: typeof CheckCircle | typeof AlertCircle | typeof Minus } {
  if (score >= 75) return { label: "Healthy", color: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle };
  if (score >= 50) return { label: "Moderate attention required", color: "text-amber-600 dark:text-amber-400", icon: AlertCircle };
  return { label: "Significant attention required", color: "text-rose-600 dark:text-rose-400", icon: AlertCircle };
}

function TrendIcon({ change }: { change: number }) {
  if (change > 1) return <TrendingUp className="size-4 text-emerald-500" />;
  if (change < -1) return <TrendingDown className="size-4 text-rose-500" />;
  return <Minus className="size-4 text-muted-foreground" />;
}

export function ExecutiveDashboard({ statement }: ExecutiveDashboardProps) {
  const totalIn = statement.totalCredit ?? 0;
  const totalOut = statement.totalDebit ?? 0;
  const netFlow = totalIn - totalOut;
  const openingBal = statement.openingBalance ?? 0;
  const closingBal = statement.closingBalance ?? 0;
  const risk = statement.riskScore;
  const overallScore = risk?.overallScore ?? 0;
  const { label, color, icon: HealthIcon } = getHealthLabel(overallScore);
  
  const monthly = statement.monthlyMetrics;
  const lastMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];
  const inflowChange = prevMonth && (prevMonth.totalCredit ?? 0) > 0
    ? (( (lastMonth.totalCredit ?? 0) - (prevMonth.totalCredit ?? 0) ) / (prevMonth.totalCredit ?? 1)) * 100
    : 0;
  const outflowChange = prevMonth && (prevMonth.totalDebit ?? 0) > 0
    ? (( (lastMonth.totalDebit ?? 0) - (prevMonth.totalDebit ?? 0) ) / (prevMonth.totalDebit ?? 1)) * 100
    : 0;

  const highSeverityInsights = statement.insights.filter(i => i.severity === "critical" || i.severity === "warning").length;
  const totalTxns = (statement.creditCount || 0) + (statement.debitCount || 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            {statement.accountName || "Financial Statement"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {getPeriodText(statement.periodStart, statement.periodEnd)} ·{" "}
            {statement.accountNumberMasked && `Account ending in ${statement.accountNumberMasked}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/finsight/upload"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          >
            <ArrowLeft className="size-4" /> New Analysis
          </Link>
          <Link
            href={`/api/finsight/report/${statement.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          >
            <Download className="size-4" /> Download PDF
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Money In"
          value={formatCurrency(totalIn)}
          subtitle={`${(statement.creditCount || 0).toLocaleString()} transactions`}
          icon={<TrendingUp className="size-5 text-emerald-500" />}
          trend={inflowChange}
          trendLabel="vs previous month"
        />
        <SummaryCard
          title="Money Out"
          value={formatCurrency(totalOut)}
          subtitle={`${(statement.debitCount || 0).toLocaleString()} transactions`}
          icon={<TrendingDown className="size-5 text-rose-500" />}
          trend={outflowChange}
          trendLabel="vs previous month"
        />
        <SummaryCard
          title="Opening Balance"
          value={formatCurrency(openingBal)}
          subtitle="Start of period"
          icon={<HelpCircle className="size-5 text-muted-foreground" />}
        />
        <SummaryCard
          title="Closing Balance"
          value={formatCurrency(closingBal)}
          subtitle="End of period"
          icon={<HelpCircle className="size-5 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Financial Activity Health Score</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            An analytical indicator based on liquidity, spending patterns, consistency, and anomalies.
            Not a credit score.
          </p>
          <div className="mt-6 flex items-center gap-8">
            <div className="relative size-48 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted-foreground/10 dark:text-white/5"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={cn(
                    "stroke-current",
                    overallScore >= 75 ? "text-emerald-500" : overallScore >= 50 ? "text-amber-500" : "text-rose-500"
                  )}
                  initial={{ strokeDashoffset: 339 }}
                  animate={{ strokeDashoffset: 339 - (339 * overallScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
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
              <p className={cn("font-semibold text-lg", color)}>
                <HealthIcon className="inline size-5 mr-2" /> {label}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This score reflects your financial activity patterns across liquidity, spending
                concentration, cash-flow stability, transaction anomalies, and balance retention.
                It is an analytical indicator only — not a regulated credit or banking score.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {risk && (
                  <>
                    <RiskFactor
                      label="Liquidity"
                      score={risk.liquidityScore ?? 0}
                      description="Ability to meet short-term obligations"
                    />
                    <RiskFactor
                      label="Spending Concentration"
                      score={risk.spendingScore ?? 0}
                      description="Diversity of outflow categories"
                    />
                    <RiskFactor
                      label="Cash-Flow Consistency"
                      score={risk.consistencyScore ?? 0}
                      description="Month-to-month stability"
                    />
                    <RiskFactor
                      label="Transaction Anomalies"
                      score={risk.anomalyScore ?? 0}
                      description="Unusual transaction patterns"
                    />
                    <RiskFactor
                      label="Balance Retention"
                      score={risk.concentrationScore ?? 0}
                      description="Inflows retained vs spent"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Quick Stats</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <QuickStat
              label="Total Transactions"
              value={totalTxns.toLocaleString()}
              help="Combined credit and debit entries"
            />
            <QuickStat
              label="Avg Monthly Inflow"
              value={monthly.length > 0
                ? formatCurrency(monthly.reduce((s, m) => s + (m.totalCredit ?? 0), 0) / monthly.length)
                : "₦0"}
              help="Average money received per month"
            />
            <QuickStat
              label="Avg Monthly Outflow"
              value={monthly.length > 0
                ? formatCurrency(monthly.reduce((s, m) => s + (m.totalDebit ?? 0), 0) / monthly.length)
                : "₦0"}
              help="Average money spent per month"
            />
            <QuickStat
              label="Statement Period"
              value={`${monthly.length} months`}
              help="Months covered in analysis"
            />
            <QuickStat
              label="Net Cash Flow"
              value={formatCurrency(netFlow)}
              help="Total inflows minus outflows"
            />
            <QuickStat
              label="File Uploaded"
              value={new Date(statement.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              help={`Original file: ${statement.uploadedFilename}`}
            />
            <QuickStat
              label="High-Priority Insights"
              value={highSeverityInsights}
              help="Patterns requiring attention"
            />
          </dl>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Top Insights</h2>
          <Link
            href={`/finsight/${statement.id}/insights`}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {statement.insights.slice(0, 3).map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
          {statement.insights.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No patterns detected yet. Try uploading a statement with more transaction history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div className="glass rounded-3xl p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-2xl md:text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="size-12 grid place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <TrendIcon change={trend} />
          <span className={cn(
            "font-medium",
            trend > 1 ? "text-emerald-600 dark:text-emerald-400" :
            trend < -1 ? "text-rose-600 dark:text-rose-400" :
            "text-muted-foreground"
          )}>
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

function RiskFactor({ label, score, description }: { label: string; score: number; description: string }) {
  const color = score >= 70 ? "text-emerald-600 dark:text-emerald-400" : score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("font-bold text-sm", color)}>{Math.round(score)}</span>
      </div>
      <div className="mt-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 70 ? "rgb(16 185 129)" : score >= 40 ? "rgb(245 158 11)" : "rgb(251 75 75)",
          }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function QuickStat({ label, value, help }: { label: string; value: string | number; help: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0" title={help}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function InsightCard({ insight }: { insight: ExecutiveDashboardProps["statement"]["insights"][0] }) {
  const severityColors = {
    info: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    warning: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    critical: "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300",
  };
  const severityIcons = {
    info: HelpCircle,
    warning: AlertCircle,
    critical: AlertCircle,
  };
  const Icon = severityIcons[insight.severity as keyof typeof severityIcons] || HelpCircle;
  const colors = severityColors[insight.severity as keyof typeof severityColors] || severityColors.info;

  return (
    <div className={cn("rounded-2xl p-4 border", colors)}>
      <div className="flex items-start gap-3">
        <Icon className="size-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{insight.title}</h3>
          <p className="mt-1 text-sm leading-relaxed">{insight.observation}</p>
          {insight.confidence && (
            <p className="mt-2 text-xs text-muted-foreground">
              Confidence: {insight.confidence.toFixed(0)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}