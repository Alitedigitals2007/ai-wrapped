"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/finsight/processor";
import { cn } from "@/lib/utils";

interface SpendingPageProps {
  statement: {
    categories: Array<{
      category: string;
      totalDebit: number;
      totalCredit: number;
      count: number;
      percentage: number;
    }>;
    totalCredit: number | null;
    totalDebit: number | null;
  };
}

const CATEGORY_COLORS = [
  "#10b981", "#f43f5e", "#06b6d4", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#22c55e",
  "#eab308", "#a855f7", "#ef4444", "#0ea5e9", "#84cc16",
];

export function SpendingPage({ statement }: SpendingPageProps) {
  const totalDebit = statement.categories.reduce((s, c) => s + c.totalDebit, 0);
  const totalCredit = statement.categories.reduce((s, c) => s + c.totalCredit, 0);

  const debitData = statement.categories
    .filter((c) => c.totalDebit > 0)
    .map((c) => ({
      category: c.category,
      value: c.totalDebit,
      count: c.count,
      percentage: totalDebit > 0 ? (c.totalDebit / totalDebit) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const creditData = statement.categories
    .filter((c) => c.totalCredit > 0)
    .map((c) => ({
      category: c.category,
      value: c.totalCredit,
      count: c.count,
      percentage: totalCredit > 0 ? (c.totalCredit / totalCredit) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Spending & Income</h1>
        <p className="mt-1 text-muted-foreground">Where your money comes from and where it goes, broken down by category.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-3xl p-5">
          <p className="text-sm text-muted-foreground">Total Inflow</p>
          <p className="mt-1 font-display text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalCredit)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{creditData.reduce((s, c) => s + c.count, 0)} transactions</p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-sm text-muted-foreground">Total Outflow</p>
          <p className="mt-1 font-display text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalDebit)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{debitData.reduce((s, c) => s + c.count, 0)} transactions</p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-sm text-muted-foreground">Income Categories</p>
          <p className="mt-1 font-display text-2xl md:text-3xl font-bold text-muted-foreground">{creditData.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Unique sources</p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-sm text-muted-foreground">Spending Categories</p>
          <p className="mt-1 font-display text-2xl md:text-3xl font-bold text-muted-foreground">{debitData.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Where money went</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Where Money Comes From</h2>
          <p className="mt-1 text-sm text-muted-foreground">Income sources by category</p>
          {creditData.length > 0 ? (
            <div className="mt-4 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={creditData.slice(0, 8).map((d, i) => ({ ...d, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {creditData.slice(0, 8).map((_, i) => (
                      <Cell key={`income-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [typeof value === "number" ? formatCurrency(value) : "₦0", ""]}
                    contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "12px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 h-[380px] flex items-center justify-center text-muted-foreground">
              No income transactions found
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Where Money Goes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Outflows by category</p>
          {debitData.length > 0 ? (
            <div className="mt-4 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debitData.slice(0, 8).map((d, i) => ({ ...d, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {debitData.slice(0, 8).map((_, i) => (
                      <Cell key={`outflow-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [typeof value === "number" ? formatCurrency(value) : "₦0", ""]}
                    contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "12px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 h-[380px] flex items-center justify-center text-muted-foreground">
              No outflow transactions found
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Top Income Sources</h2>
          <div className="mt-4 space-y-3">
            {creditData.slice(0, 10).map((cat, i) => (
              <CategoryRow key={i} category={cat} total={totalCredit} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} isIncome />
            ))}
            {creditData.length === 0 && <p className="text-center text-muted-foreground py-8">No income data</p>}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Top Spending Categories</h2>
          <div className="mt-4 space-y-3">
            {debitData.slice(0, 10).map((cat, i) => (
              <CategoryRow key={i} category={cat} total={totalDebit} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
            ))}
            {debitData.length === 0 && <p className="text-center text-muted-foreground py-8">No spending data</p>}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 overflow-x-auto">
        <h2 className="font-semibold text-lg mb-4">All Categories Detail</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">Income</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">%</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Count</th>
                </tr>
              </thead>
              <tbody>
                {creditData.map((cat, i) => (
                  <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                    <td className="py-2 px-3 flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      {cat.category}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(cat.value)}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{cat.percentage.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-3">Outflow</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">%</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Count</th>
                </tr>
              </thead>
              <tbody>
                {debitData.map((cat, i) => (
                  <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                    <td className="py-2 px-3 flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      {cat.category}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400">{formatCurrency(cat.value)}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{cat.percentage.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  total,
  color,
  isIncome = false,
}: {
  category: { category: string; value: number; percentage: number; count: number };
  total: number;
  color: string;
  isIncome?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 grid place-items-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{category.category}</p>
        <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${category.percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <div className="text-right w-32 shrink-0">
        <p className="font-semibold" style={{ color: isIncome ? "rgb(16 185 129)" : "rgb(251 75 75)" }}>
          {formatCurrency(category.value)}
        </p>
        <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
      </div>
    </div>
  );
}