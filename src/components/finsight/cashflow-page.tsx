"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/finsight/processor";
import { cn } from "@/lib/utils";

interface CashFlowPageProps {
  statement: {
    monthlyMetrics: Array<{
      month: Date;
      totalCredit: { toNumber(): number } | null;
      totalDebit: { toNumber(): number } | null;
      netFlow: { toNumber(): number } | null;
      transactionCount: number;
      endingBalance?: { toNumber(): number } | null;
    }>;
    totalCredit: { toNumber(): number } | null;
    totalDebit: { toNumber(): number } | null;
  };
}

const MONTH_COLORS = ["#10b981", "#f43f5e", "#06b6d4"];

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(date);
}

export function CashFlowPage({ statement }: CashFlowPageProps) {
  const monthly = statement.monthlyMetrics;
  const totalIn = statement.totalCredit?.toNumber() || 0;
  const totalOut = statement.totalDebit?.toNumber() || 0;
  const netFlow = totalIn - totalOut;
  const avgInflow = monthly.length > 0 ? totalIn / monthly.length : 0;
  const avgOutflow = monthly.length > 0 ? totalOut / monthly.length : 0;

  const chartData = monthly.map((m) => ({
    month: formatMonth(m.month),
    date: m.month,
    moneyIn: m.totalCredit?.toNumber() || 0,
    moneyOut: m.totalDebit?.toNumber() || 0,
    netFlow: m.netFlow?.toNumber() || 0,
    transactions: m.transactionCount,
    balance: m.endingBalance?.toNumber() || 0,
  }));

  const summaryCards = [
    { label: "Avg Monthly Inflow", value: formatCurrency(avgInflow), color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Avg Monthly Outflow", value: formatCurrency(avgOutflow), color: "text-rose-600 dark:text-rose-400" },
    { label: "Net Cash Flow", value: formatCurrency(netFlow), color: netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
    { label: "Months Analyzed", value: monthly.length.toString(), color: "text-muted-foreground" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Cash Flow</h1>
        <p className="mt-1 text-muted-foreground">Monthly money in, money out, and net flow over the statement period.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="glass rounded-3xl p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 font-display text-2xl md:text-3xl font-bold" style={{ color: `var(--tw-text-opacity)` }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-semibold text-lg">Monthly Cash Flow</h2>
        <div className="mt-4 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value).replace("₦", "₦")}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [typeof value === "number" ? formatCurrency(value) : "₦0", ""]}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="moneyIn"
                name="Money In"
                stroke="#10b981"
                fill="url(#colorIn)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="moneyOut"
                name="Money Out"
                stroke="#f43f5e"
                fill="url(#colorOut)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Net Flow Trend</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v).replace("₦", "₦")} />
                <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [typeof value === "number" ? formatCurrency(value) : "₦0", "Net Flow"]} contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                <Bar dataKey="netFlow" name="Net Flow" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={chartData[i].netFlow >= 0 ? "#10b981" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold text-lg">Transaction Volume</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} />
                <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [typeof value === "number" ? value.toLocaleString() : "0", "Transactions"]} contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="transactions" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 overflow-x-auto">
        <h2 className="font-semibold text-lg mb-4">Monthly Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Money In</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Money Out</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Net Flow</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Transactions</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-medium">{row.month}</td>
                <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(row.moneyIn)}</td>
                <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400">{formatCurrency(row.moneyOut)}</td>
                <td className={cn("py-3 px-4 text-right font-medium", row.netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {row.netFlow >= 0 ? "+" : ""}{formatCurrency(row.netFlow)}
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground">{row.transactions.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}