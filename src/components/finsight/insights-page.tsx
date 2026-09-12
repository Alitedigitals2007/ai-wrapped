"use client";

import { AlertCircle, CheckCircle, HelpCircle, TrendingUp, TrendingDown, Shield, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightsPageProps {
  statement: {
    insights: Array<{
      type: string;
      severity: string;
      title: string;
      observation: string;
      explanation?: string | null;
      recommendation?: string | null;
      confidence: { toNumber(): number } | null;
    }>;
    transactions: Array<{
      description: string;
      debit: { toNumber(): number };
      credit: { toNumber(): number };
      category?: string | null;
    }>;
    monthlyMetrics: Array<{
      month: Date;
      totalCredit: { toNumber(): number };
      totalDebit: { toNumber(): number };
      netFlow: { toNumber(): number };
    }>;
  };
}

const SEVERITY_CONFIG = {
  info: { icon: HelpCircle, color: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300", label: "Informational" },
  warning: { icon: AlertCircle, color: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300", label: "Attention Needed" },
  critical: { icon: Shield, color: "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300", label: "Critical" },
};

const TYPE_ICONS: Record<string, typeof AlertCircle | typeof CheckCircle | typeof HelpCircle | typeof TrendingUp | typeof TrendingDown | typeof Lightbulb | typeof Target | typeof Shield> = {
  high_velocity: TrendingUp,
  concentration: Target,
  improvement: CheckCircle,
  concern: TrendingDown,
  low_retention: Shield,
  recurring: Lightbulb,
  anomaly: AlertCircle,
};

export function InsightsPage({ statement }: InsightsPageProps) {
  const insights = statement.insights;

  if (insights.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Insights</h1>
          <p className="mt-1 text-muted-foreground">Patterns and anomalies detected in your financial data.</p>
        </div>
        <div className="glass rounded-3xl p-12 text-center">
          <HelpCircle className="mx-auto size-16 text-muted-foreground/50" />
          <h2 className="mt-4 font-semibold text-lg">No insights yet</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Upload a statement with more transaction history to detect patterns, anomalies,
            and recurring transactions.
          </p>
        </div>
      </div>
    );
  }

  const grouped = insights.reduce((acc, insight) => {
    const severity = insight.severity as keyof typeof SEVERITY_CONFIG;
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(insight);
    return acc;
  }, {} as Record<string, typeof insights>);

  const severityOrder = ["critical", "warning", "info"] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Insights</h1>
        <p className="mt-1 text-muted-foreground">
          {insights.length} pattern{insights.length !== 1 ? "s" : ""} detected —{" "}
          {insights.filter(i => i.severity === "critical").length} critical,{" "}
          {insights.filter(i => i.severity === "warning").length} warning,{" "}
          {insights.filter(i => i.severity === "info").length} informational.
        </p>
      </div>

      {severityOrder.map((severity) => {
        const items = grouped[severity];
        if (!items || items.length === 0) return null;
        const config = SEVERITY_CONFIG[severity];
        const Icon = config.icon;
        return (
          <section key={severity} className="space-y-4">
            <div className="flex items-center gap-3">
              <Icon className={cn("size-5", config.color.replace("bg-", "text-").replace("border-", "text-").split(" ")[0])} />
              <h2 className="font-semibold text-lg">{config.label} ({items.length})</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((insight, i) => {
                const TypeIcon = TYPE_ICONS[insight.type] || HelpCircle;
                return (
                  <InsightCard
                    key={`${severity}-${i}`}
                    insight={insight}
                    TypeIcon={TypeIcon}
                    config={config}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function InsightCard({
  insight,
  TypeIcon,
  config,
}: {
  insight: InsightsPageProps["statement"]["insights"][0];
  TypeIcon: typeof AlertCircle;
  config: { color: string; label: string; icon: typeof AlertCircle };
}) {
  const confidence = insight.confidence?.toNumber() || 0;

  return (
    <div className={cn("rounded-2xl p-5 border transition-all hover:shadow-lg", config.color)}>
      <div className="flex items-start gap-3">
        <TypeIcon className={cn("size-5 shrink-0 mt-0.5", config.color.replace("bg-", "text-").replace("border-", "text-").split(" ")[0])} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{insight.title}</h3>
          <p className="mt-1 text-sm leading-relaxed">{insight.observation}</p>
          
          {insight.explanation && (
            <details className="mt-3 group">
              <summary className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground cursor-pointer list-none">
                <HelpCircle className="size-3.5" /> Why this matters
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{insight.explanation}</p>
            </details>
          )}
          
          {insight.recommendation && (
            <details className="mt-3 group">
              <summary className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer list-none">
                <Lightbulb className="size-3.5" /> What you can do
              </summary>
              <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">{insight.recommendation}</p>
            </details>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="size-3.5" /> Confidence: {confidence.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
              {insight.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}