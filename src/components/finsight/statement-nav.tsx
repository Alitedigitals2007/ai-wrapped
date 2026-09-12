"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Download, Plus, FileText, BarChart3, TrendingUp, AlertTriangle, Shield, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/finsight/processor";

interface StatementNavProps {
  statement: {
    id: string;
    accountName?: string | null;
    accountNumberMasked?: string | null;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    totalCredit: number | null;
    totalDebit: number | null;
    closingBalance: number | null;
    uploadedAt: Date;
  };
}

const NAV_ITEMS = [
  { href: "", label: "Executive", icon: FileText },
  { href: "cashflow", label: "Cash Flow", icon: BarChart3 },
  { href: "spending", label: "Spending", icon: TrendingUp },
  { href: "insights", label: "Insights", icon: AlertTriangle },
  { href: "risk", label: "Risk", icon: Shield },
];

export function StatementNav({ statement }: StatementNavProps) {
  const pathname = usePathname();
  const totalIn = statement.totalCredit ?? 0;
  const totalOut = statement.totalDebit ?? 0;
  const balance = statement.closingBalance ?? 0;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/finsight/upload"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              FinSight
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1" aria-label="Statement sections">
            {NAV_ITEMS.map((item) => {
              const href = `/finsight/${statement.id}${item.href ? `/${item.href}` : ""}`;
              const isActive = pathname === href || (item.href && pathname.startsWith(href + "/"));
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <span className="text-muted-foreground">Money In</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(totalIn)}
              </span>
              <span className="text-muted-foreground">Money Out</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {formatCurrency(totalOut)}
              </span>
              <span className="text-muted-foreground">Balance</span>
              <span className={cn("font-semibold", balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                {formatCurrency(balance)}
              </span>
            </div>

            <ThemeToggle />
            <Link
              href="/finsight/upload"
              className="hidden sm:inline-flex rounded-full border border-border/70 text-muted-foreground hover:text-foreground text-sm font-semibold px-4 py-2 transition-colors"
            >
              <Plus className="mr-1.5 size-4" /> New Analysis
            </Link>
          </div>
        </div>

        <div className="md:hidden h-px bg-black/5 dark:bg-white/10" />

        <nav className="md:hidden overflow-x-auto pb-3 -mx-4 px-4" aria-label="Statement sections mobile">
          <div className="flex gap-2 min-w-max">
            {NAV_ITEMS.map((item) => {
              const href = `/finsight/${statement.id}${item.href ? `/${item.href}` : ""}`;
              const isActive = pathname === href || (item.href && pathname.startsWith(href + "/"));
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}