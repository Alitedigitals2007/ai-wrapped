import * as XLSX from "xlsx";
import { Decimal } from "@prisma/client/runtime/library";

export interface NormalizedTransaction {
  date: Date;
  description: string;
  debit: number;
  credit: number;
  balance?: number;
  channel?: string;
  reference?: string;
  valueDate?: Date;
}

export interface ProcessedStatement {
  accountName?: string;
  accountNumberMasked?: string;
  periodStart?: Date;
  periodEnd?: Date;
  openingBalance?: number;
  closingBalance?: number;
  totalCredit: number;
  totalDebit: number;
  creditCount: number;
  debitCount: number;
  transactions: NormalizedTransaction[];
  monthlyMetrics: MonthlyMetric[];
  categories: CategoryBreakdown[];
  insights: Insight[];
  riskScore: RiskScoreBreakdown;
}

export interface MonthlyMetric {
  month: Date;
  totalCredit: number;
  totalDebit: number;
  netFlow: number;
  transactionCount: number;
  averageBalance?: number;
  endingBalance?: number;
}

export interface CategoryBreakdown {
  category: string;
  totalDebit: number;
  totalCredit: number;
  count: number;
  percentage: number;
}

export interface Insight {
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  observation: string;
  explanation?: string;
  recommendation?: string;
  confidence: number;
}

export interface RiskScoreBreakdown {
  overallScore: number;
  liquidityScore: number;
  spendingScore: number;
  consistencyScore: number;
  anomalyScore: number;
  concentrationScore: number;
}

const COLUMN_ALIASES: Record<string, string[]> = {
  date: [
    "transaction date",
    "date",
    "trans date",
    "transaction_date",
    "trans date",
    "value date",
    "posting date",
    "val date",
  ],
  description: [
    "description",
    "narration",
    "transaction details",
    "details",
    "particulars",
    "remarks",
    "memo",
  ],
  debit: [
    "debit",
    "withdrawal",
    "money out",
    "dr",
    "outflow",
    "debit amount",
  ],
  credit: [
    "credit",
    "deposit",
    "money in",
    "cr",
    "inflow",
    "credit amount",
  ],
  balance: [
    "balance",
    "running balance",
    "current balance",
    "ledger balance",
  ],
  reference: [
    "reference",
    "transaction reference",
    "ref",
    "txn ref",
    "utr",
  ],
  channel: [
    "channel",
    "mode",
    "type",
    "payment mode",
  ],
};

const CATEGORY_RULES: Record<string, string[]> = {
  "Airtime": ["airtime", "recharge", "topup", "top up"],
  "Data": ["data", "bundle", "internet", "mifi", "wifi"],
  "Bank Charges": ["charge", "fee", "commission", "vat", "levy", "stamp duty", "sms charge", "card maintenance", "account maintenance"],
  "Transfer": ["transfer", "trf", "funds transfer", "interbank", "intrabank", "nip", "imps", "neft", "rtgs", "upi"],
  "POS": ["pos", "point of sale", "merchant", "card payment", "swipe"],
  "ATM": ["atm", "cash withdrawal", "cash out", "withdrawal"],
  "Bills": ["bill", "utility", "electricity", "water", "dstv", "gotv", "startimes", "ikeja", "phcn", "billing"],
  "Salary": ["salary", "payroll", "wages", "stipend", "allowance"],
  "Income": ["income", "receipt", "payment received", "inward"],
  "Loan": ["loan", "emi", "repayment", "installment"],
  "Investment": ["investment", "mutual fund", "sip", "fixed deposit", "fd", "treasury"],
  "Insurance": ["insurance", "premium", "policy"],
  "Shopping": ["shopping", "amazon", "flipkart", "jumia", "kong", "store", "mall"],
  "Food": ["food", "restaurant", "swiggy", "zomato", "uber eats", "foodpanda", "cafe", "coffee"],
  "Transport": ["transport", "uber", "bolt", "lyft", "taxi", "bus", "metro", "fuel", "petrol", "diesel"],
  "Health": ["health", "hospital", "pharmacy", "clinic", "doctor", "medical", "lab", "diagnostic"],
  "Education": ["education", "school", "college", "university", "course", "training", "certification"],
  "Entertainment": ["entertainment", "movie", "cinema", "netflix", "spotify", "prime", "hotstar", "gaming", "playstation", "xbox"],
};

function normalizeColumnName(name: string): string {
  return name.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
}

function findColumn(headers: string[], target: string): number {
  const normalizedHeaders = headers.map(normalizeColumnName);
  const aliases = COLUMN_ALIASES[target] || [target];
  
  for (const alias of aliases) {
    const idx = normalizedHeaders.findIndex(h => h.includes(alias));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseAmount(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const str = String(val).replace(/[₦,₹$£€\s]/g, "").replace(/\((.*)\)/, "-$1");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.abs(num);
}

function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  
  const str = String(val).trim();
  const excelEpoch = new Date(1899, 11, 30);
  
  if (/^\d{5}$/.test(str)) {
    const days = parseInt(str, 10);
    return new Date(excelEpoch.getTime() + days * 86400000);
  }
  
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function categorize(description: string): string {
  const text = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) return category;
    }
  }
  return "Other";
}

function detectTransactionSheets(workbook: XLSX.WorkBook): string[] {
  const transactionSheets: string[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (data.length < 2) continue;
    
    const headers = data[0] as string[];
    const hasDate = findColumn(headers, "date") >= 0;
    const hasMoney = findColumn(headers, "debit") >= 0 || findColumn(headers, "credit") >= 0 || findColumn(headers, "balance") >= 0;
    const hasDescription = findColumn(headers, "description") >= 0;
    
    if (hasDate && hasMoney && hasDescription) {
      transactionSheets.push(sheetName);
    }
  }
  
  return transactionSheets;
}

function extractTransactions(sheet: XLSX.WorkSheet): NormalizedTransaction[] {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (data.length < 2) return [];
  
  const headers = data[0] as string[];
  const dateCol = findColumn(headers, "date");
  const descCol = findColumn(headers, "description");
  const debitCol = findColumn(headers, "debit");
  const creditCol = findColumn(headers, "credit");
  const balanceCol = findColumn(headers, "balance");
  const referenceCol = findColumn(headers, "reference");
  const channelCol = findColumn(headers, "channel");
  
  if (dateCol < 0 || descCol < 0) return [];
  
  const transactions: NormalizedTransaction[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i] as (string | number)[];
    if (!row || row.length === 0) continue;
    
    const date = parseDate(row[dateCol]);
    const description = String(row[descCol] || "").trim();
    
    if (!date || !description) continue;
    
    const debit = debitCol >= 0 ? parseAmount(row[debitCol]) : 0;
    const credit = creditCol >= 0 ? parseAmount(row[creditCol]) : 0;
    
    if (debit === 0 && credit === 0) continue;
    
    transactions.push({
      date,
      description,
      debit,
      credit,
      balance: balanceCol >= 0 ? parseAmount(row[balanceCol]) : undefined,
      reference: referenceCol >= 0 ? String(row[referenceCol] || "").trim() : undefined,
      channel: channelCol >= 0 ? String(row[channelCol] || "").trim() : undefined,
    });
  }
  
  return transactions;
}

function cleanTransactions(transactions: NormalizedTransaction[]): NormalizedTransaction[] {
  return transactions
    .filter(t => t.date && t.description && (t.debit > 0 || t.credit > 0))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function aggregateMonthly(transactions: NormalizedTransaction[]): MonthlyMetric[] {
  const monthlyMap = new Map<string, MonthlyMetric>();
  
  for (const tx of transactions) {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthlyMap.get(key);
    const monthDate = new Date(tx.date.getFullYear(), tx.date.getMonth(), 1);
    
    if (existing) {
      existing.totalCredit += tx.credit;
      existing.totalDebit += tx.debit;
      existing.netFlow = existing.totalCredit - existing.totalDebit;
      existing.transactionCount += 1;
      existing.endingBalance = tx.balance ?? existing.endingBalance;
    } else {
      monthlyMap.set(key, {
        month: monthDate,
        totalCredit: tx.credit,
        totalDebit: tx.debit,
        netFlow: tx.credit - tx.debit,
        transactionCount: 1,
        endingBalance: tx.balance,
      });
    }
  }
  
  const sorted = Array.from(monthlyMap.values()).sort((a, b) => a.month.getTime() - b.month.getTime());
  
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    m.averageBalance = i > 0 
      ? (sorted.slice(0, i + 1).reduce((sum, x) => sum + (x.endingBalance || 0), 0) / (i + 1))
      : m.endingBalance;
  }
  
  return sorted;
}

function categorizeTransactions(transactions: NormalizedTransaction[]): CategoryBreakdown[] {
  const catMap = new Map<string, { debit: number; credit: number; count: number }>();
  
  for (const tx of transactions) {
    const cat = categorize(tx.description);
    const existing = catMap.get(cat) || { debit: 0, credit: 0, count: 0 };
    existing.debit += tx.debit;
    existing.credit += tx.credit;
    existing.count += 1;
    catMap.set(cat, existing);
  }
  
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  
  return Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      totalDebit: data.debit,
      totalCredit: data.credit,
      count: data.count,
      percentage: totalDebit > 0 ? (data.debit / totalDebit) * 100 : 0,
    }))
    .sort((a, b) => b.totalDebit - a.totalDebit);
}

function detectPatterns(
  transactions: NormalizedTransaction[],
  monthly: MonthlyMetric[],
  categories: CategoryBreakdown[]
): Insight[] {
  const insights: Insight[] = [];
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  
  const days = monthly.length > 1 
    ? (monthly[monthly.length - 1].month.getTime() - monthly[0].month.getTime()) / 86400000
    : 30;
  const velocity = transactions.length / Math.max(days, 1);
  
  if (velocity > 5) {
    insights.push({
      type: "high_velocity",
      severity: "info",
      title: "High Transaction Velocity",
      observation: `Average ${velocity.toFixed(1)} transactions per day over ${days.toFixed(0)} days.`,
      explanation: "A high volume of transactions suggests active account usage, possibly for business or frequent personal spending.",
      recommendation: "Review if all transactions are expected. Consider consolidating recurring payments.",
      confidence: 85,
    });
  }
  
  if (categories.length > 0 && categories[0].percentage > 50) {
    insights.push({
      type: "concentration",
      severity: "warning",
      title: "Spending Concentration",
      observation: `${categories[0].category} represents ${categories[0].percentage.toFixed(0)}% of total outflows (₦${categories[0].totalDebit.toLocaleString()}).`,
      explanation: "High concentration in one category may indicate dependency on a single spending channel or recurring large transfers.",
      recommendation: "Review the top category transactions. Consider diversifying payment methods.",
      confidence: 90,
    });
  }
  
  const lastMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];
  if (lastMonth && prevMonth) {
    const inflowChange = prevMonth.totalCredit > 0 ? ((lastMonth.totalCredit - prevMonth.totalCredit) / prevMonth.totalCredit) * 100 : 0;
    const outflowChange = prevMonth.totalDebit > 0 ? ((lastMonth.totalDebit - prevMonth.totalDebit) / prevMonth.totalDebit) * 100 : 0;
    
    if (outflowChange < -15) {
      insights.push({
        type: "improvement",
        severity: "info",
        title: "Outflow Decreasing",
        observation: `Monthly outflow decreased by ${Math.abs(outflowChange).toFixed(0)}% compared to previous month.`,
        explanation: "Reduced spending is generally positive for cash flow management.",
        recommendation: "Maintain this trend. Identify what changed and keep it going.",
        confidence: 80,
      });
    }
    if (outflowChange > 25) {
      insights.push({
        type: "concern",
        severity: "warning",
        title: "Outflow Increasing",
        observation: `Monthly outflow increased by ${outflowChange.toFixed(0)}% compared to previous month.`,
        explanation: "A sharp rise in spending may strain cash flow if sustained.",
        recommendation: "Review new or increased expenses. Check for unauthorized transactions.",
        confidence: 85,
      });
    }
  }
  
  const balanceRetention = lastMonth && totalCredit > 0 ? (lastMonth.endingBalance || 0) / totalCredit : 0;
  if (balanceRetention < 0.1 && totalCredit > 0) {
    insights.push({
      type: "low_retention",
      severity: "warning",
      title: "Low Balance Retention",
      observation: `Only ${(balanceRetention * 100).toFixed(0)}% of total inflows remains as closing balance.`,
      explanation: "Most money entering the account leaves quickly. This may indicate the account is used as a pass-through or for high-frequency transactions.",
      recommendation: "Consider maintaining a minimum reserve. Separate transaction accounts from savings.",
      confidence: 75,
    });
  }
  
  const recurringMap = new Map<string, { amounts: number[]; dates: Date[]; count: number }>();
  for (const tx of transactions.filter(t => t.debit > 0)) {
    const key = `${categorize(tx.description)}|${tx.debit}`;
    const existing = recurringMap.get(key) || { amounts: [], dates: [], count: 0 };
    existing.amounts.push(tx.debit);
    existing.dates.push(tx.date);
    existing.count += 1;
    recurringMap.set(key, existing);
  }
  
  for (const [key, data] of recurringMap) {
    if (data.count >= 3) {
      const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
      const intervals = [];
      for (let i = 1; i < sortedDates.length; i++) {
        intervals.push((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / 86400000);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, x) => sum + Math.pow(x - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 100 && avgInterval > 20 && avgInterval < 45) {
        const [cat] = key.split("|");
        insights.push({
          type: "recurring",
          severity: "info",
          title: "Recurring Transaction Detected",
          observation: `${cat} of ₦${data.amounts[0].toLocaleString()} appears every ~${avgInterval.toFixed(0)} days (${data.count} occurrences).`,
          explanation: "Regular intervals suggest a subscription, loan payment, or scheduled transfer.",
          recommendation: "Verify this is intentional. Consider setting up alerts for changes.",
          confidence: 88,
        });
        break;
      }
    }
  }
  
  const debitAmounts = transactions.filter(t => t.debit > 0).map(t => t.debit);
  if (debitAmounts.length > 10) {
    const mean = debitAmounts.reduce((a, b) => a + b, 0) / debitAmounts.length;
    const std = Math.sqrt(debitAmounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / debitAmounts.length);
    const threshold = mean + 3 * std;
    const unusual = debitAmounts.filter(x => x > threshold).length;
    
    if (unusual > 0) {
      insights.push({
        type: "anomaly",
        severity: "warning",
        title: "Unusual Transactions",
        observation: `${unusual} transaction(s) exceed 3 standard deviations from the mean debit amount (₦${threshold.toLocaleString()}).`,
        explanation: "Statistically unusual amounts may indicate large one-off payments, errors, or transactions requiring review.",
        recommendation: "Review the flagged transactions manually. Verify they are authorized.",
        confidence: 70,
      });
    }
  }
  
  return insights;
}

function calculateRiskScore(
  transactions: NormalizedTransaction[],
  monthly: MonthlyMetric[],
  categories: CategoryBreakdown[],
  insights: Insight[]
): RiskScoreBreakdown {
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  const lastMonth = monthly[monthly.length - 1];
  const closingBalance = lastMonth?.endingBalance || 0;
  
  const liquidityScore = totalCredit > 0 ? Math.min(100, (closingBalance / (totalCredit / monthly.length)) * 100) : 50;
  
  const topCatPct = categories[0]?.percentage || 0;
  const spendingScore = Math.max(0, 100 - topCatPct);
  
  const monthlyDebits = monthly.map(m => m.totalDebit);
  const meanDebit = monthlyDebits.reduce((a, b) => a + b, 0) / monthlyDebits.length || 1;
  const stdDebit = Math.sqrt(monthlyDebits.reduce((sum, x) => sum + Math.pow(x - meanDebit, 2), 0) / monthlyDebits.length);
  const consistencyScore = meanDebit > 0 ? Math.max(0, 100 - (stdDebit / meanDebit) * 100) : 50;
  
  const anomalyInsights = insights.filter(i => i.type === "anomaly").length;
  const anomalyScore = Math.max(0, 100 - anomalyInsights * 20);
  
  const concentrationScore = Math.max(0, 100 - topCatPct);
  
  const overallScore = (
    liquidityScore * 0.25 +
    spendingScore * 0.20 +
    consistencyScore * 0.20 +
    anomalyScore * 0.15 +
    concentrationScore * 0.10 +
    50 * 0.10
  );
  
  return {
    overallScore: Math.round(overallScore * 100) / 100,
    liquidityScore: Math.round(liquidityScore * 100) / 100,
    spendingScore: Math.round(spendingScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    anomalyScore: Math.round(anomalyScore * 100) / 100,
    concentrationScore: Math.round(concentrationScore * 100) / 100,
  };
}

export async function processExcelFile(buffer: Buffer, filename: string): Promise<ProcessedStatement> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const transactionSheets = detectTransactionSheets(workbook);
  
  if (transactionSheets.length === 0) {
    throw new Error("No transaction sheets detected. Ensure the file has date, description, and amount columns.");
  }
  
  let allTransactions: NormalizedTransaction[] = [];
  
  for (const sheetName of transactionSheets) {
    const sheet = workbook.Sheets[sheetName];
    const txs = extractTransactions(sheet);
    allTransactions.push(...txs);
  }
  
  allTransactions = cleanTransactions(allTransactions);
  
  if (allTransactions.length === 0) {
    throw new Error("No valid transactions found after cleaning.");
  }
  
  const totalCredit = allTransactions.reduce((sum, t) => sum + t.credit, 0);
  const totalDebit = allTransactions.reduce((sum, t) => sum + t.debit, 0);
  const creditCount = allTransactions.filter(t => t.credit > 0).length;
  const debitCount = allTransactions.filter(t => t.debit > 0).length;
  
  const dates = allTransactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime());
  const periodStart = dates[0];
  const periodEnd = dates[dates.length - 1];
  
  const openingBalance = allTransactions[0]?.balance ?? 0;
  const closingBalance = allTransactions[allTransactions.length - 1]?.balance ?? (openingBalance + totalCredit - totalDebit);
  
  const monthly = aggregateMonthly(allTransactions);
  const categories = categorizeTransactions(allTransactions);
  const insights = detectPatterns(allTransactions, monthly, categories);
  const riskScore = calculateRiskScore(allTransactions, monthly, categories, insights);
  
  return {
    accountName: undefined,
    accountNumberMasked: undefined,
    periodStart,
    periodEnd,
    openingBalance,
    closingBalance,
    totalCredit,
    totalDebit,
    creditCount,
    debitCount,
    transactions: allTransactions,
    monthlyMetrics: monthly,
    categories,
    insights,
    riskScore,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}