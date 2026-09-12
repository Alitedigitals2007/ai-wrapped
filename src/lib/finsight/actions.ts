"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { processExcelFile, ProcessedStatement } from "@/lib/finsight/processor";
import { Decimal } from "@prisma/client/runtime/library";

function serialize<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Prisma.Decimal.isDecimal(value)) {
    return (value as unknown as Prisma.Decimal).toNumber() as unknown as T;
  }
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((v) => serialize(v)) as unknown as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serialize(v);
    }
    return out as T;
  }
  return value;
}

export interface UploadResult {
  success: boolean;
  statementId?: string;
  error?: string;
  progress?: string;
}

export async function uploadAndAnalyzeStatement(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File;
  
  if (!file) {
    return { success: false, error: "No file provided" };
  }
  
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type. Please upload .xlsx or .xls files." };
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, error: "File too large. Maximum size is 10MB." };
  }
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await processExcelFile(buffer, file.name);

    const statement = await prisma.finSightStatement.create({
      data: {
        accountName: processed.accountName,
        accountNumberMasked: processed.accountNumberMasked,
        statementType: "bank",
        periodStart: processed.periodStart,
        periodEnd: processed.periodEnd,
        openingBalance: new Decimal(processed.openingBalance || 0),
        closingBalance: new Decimal(processed.closingBalance || 0),
        totalCredit: new Decimal(processed.totalCredit),
        totalDebit: new Decimal(processed.totalDebit),
        creditCount: processed.creditCount,
        debitCount: processed.debitCount,
        uploadedFilename: file.name,
        status: "processing",
        processedAt: new Date(),
      },
    });

    try {
      const txRows = processed.transactions.map((t) => ({
        statementId: statement.id,
        transactionDate: t.date,
        valueDate: t.valueDate ?? null,
        description: t.description,
        debit: new Decimal(t.debit),
        credit: new Decimal(t.credit),
        balance: t.balance !== undefined ? new Decimal(t.balance) : null,
        channel: t.channel ?? null,
        reference: t.reference ?? null,
        category: categorizedCategory(t.description),
        normalizedDescription: t.description,
      }));

      for (const batch of chunk(txRows, 1000)) {
        await prisma.finSightTransaction.createMany({ data: batch });
      }

      if (processed.monthlyMetrics.length > 0) {
        await prisma.finSightMonthlyMetric.createMany({
          data: processed.monthlyMetrics.map((m) => ({
            statementId: statement.id,
            month: m.month,
            totalCredit: new Decimal(m.totalCredit),
            totalDebit: new Decimal(m.totalDebit),
            netFlow: new Decimal(m.netFlow),
            transactionCount: m.transactionCount,
            averageBalance: m.averageBalance !== undefined ? new Decimal(m.averageBalance) : null,
            endingBalance: m.endingBalance !== undefined ? new Decimal(m.endingBalance) : null,
          })),
        });
      }

      if (processed.insights.length > 0) {
        await prisma.finSightInsight.createMany({
          data: processed.insights.map((i) => ({
            statementId: statement.id,
            type: i.type,
            severity: i.severity,
            title: i.title,
            observation: i.observation,
            explanation: i.explanation ?? null,
            recommendation: i.recommendation ?? null,
            confidence: i.confidence ? new Decimal(i.confidence) : null,
          })),
        });
      }

      await prisma.finSightRiskScore.create({
        data: {
          statementId: statement.id,
          overallScore: new Decimal(processed.riskScore.overallScore),
          liquidityScore: new Decimal(processed.riskScore.liquidityScore),
          spendingScore: new Decimal(processed.riskScore.spendingScore),
          consistencyScore: new Decimal(processed.riskScore.consistencyScore),
          anomalyScore: new Decimal(processed.riskScore.anomalyScore),
          concentrationScore: new Decimal(processed.riskScore.concentrationScore),
        },
      });

      await prisma.finSightStatement.update({
        where: { id: statement.id },
        data: { status: "completed" },
      });
    } catch (innerError) {
      await prisma.finSightStatement
        .delete({ where: { id: statement.id } })
        .catch(() => undefined);
      throw innerError;
    }

    return { success: true, statementId: statement.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process file" 
    };
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function categorizedCategory(description: string): string {
  return categorizeDescription(description);
}

function categorizeDescription(description: string): string {
  const text = description.toLowerCase();
  const rules: Record<string, string[]> = {
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
  
  for (const [category, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) return category;
    }
  }
  return "Other";
}

export interface CategoryTotal {
  category: string;
  totalDebit: number;
  totalCredit: number;
  count: number;
  percentage: number;
}

export interface StatementMonthlyMetric {
  id: string;
  statementId: string;
  month: Date;
  totalCredit: number | null;
  totalDebit: number | null;
  netFlow: number | null;
  transactionCount: number;
  averageBalance: number | null;
  endingBalance: number | null;
}

export interface StatementInsight {
  id: string;
  statementId: string;
  type: string;
  severity: string;
  title: string;
  observation: string;
  explanation: string | null;
  recommendation: string | null;
  confidence: number | null;
}

export interface StatementRiskScore {
  id: string;
  statementId: string;
  overallScore: number | null;
  liquidityScore: number | null;
  spendingScore: number | null;
  consistencyScore: number | null;
  anomalyScore: number | null;
  concentrationScore: number | null;
}

export interface StatementDetail {
  id: string;
  accountName: string | null;
  accountNumberMasked: string | null;
  statementType: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  openingBalance: number | null;
  closingBalance: number | null;
  totalCredit: number | null;
  totalDebit: number | null;
  creditCount: number | null;
  debitCount: number | null;
  uploadedFilename: string | null;
  uploadedAt: Date;
  processedAt: Date | null;
  status: string;
  monthlyMetrics: StatementMonthlyMetric[];
  insights: StatementInsight[];
  riskScore: StatementRiskScore | null;
  categories: CategoryTotal[];
}

export async function getStatement(id: string): Promise<StatementDetail | null> {
  const statement = await prisma.finSightStatement.findUnique({
    where: { id },
    include: {
      monthlyMetrics: { orderBy: { month: "asc" } },
      insights: { orderBy: { createdAt: "desc" } },
      riskScore: true,
    },
  });

  if (!statement) return null;

  const groups = await prisma.finSightTransaction.groupBy({
    by: ["category"],
    where: { statementId: id },
    _sum: { debit: true, credit: true },
    _count: { _all: true },
  });

  const totalDebit = groups.reduce((s, g) => s + (g._sum.debit?.toNumber() ?? 0), 0);
  const totalCredit = groups.reduce((s, g) => s + (g._sum.credit?.toNumber() ?? 0), 0);

  const categories: CategoryTotal[] = groups
    .map((g) => {
      const debit = g._sum.debit?.toNumber() ?? 0;
      const credit = g._sum.credit?.toNumber() ?? 0;
      return {
        category: g.category ?? "Other",
        totalDebit: debit,
        totalCredit: credit,
        count: g._count._all,
        percentage: totalDebit > 0 ? (debit / totalDebit) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalDebit - a.totalDebit);

  return serialize({ ...statement, categories }) as unknown as StatementDetail;
}

export interface StatementSummary {
  id: string;
  accountName: string | null;
  accountNumberMasked: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  totalCredit: number | null;
  totalDebit: number | null;
  closingBalance: number | null;
  uploadedFilename: string | null;
  uploadedAt: Date;
  status: string;
  _count: { transactions: number };
}

export async function getStatements(): Promise<StatementSummary[]> {
  const statements = await prisma.finSightStatement.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 20,
    select: {
      id: true,
      accountName: true,
      accountNumberMasked: true,
      periodStart: true,
      periodEnd: true,
      totalCredit: true,
      totalDebit: true,
      closingBalance: true,
      uploadedFilename: true,
      uploadedAt: true,
      status: true,
      _count: { select: { transactions: true } },
    },
  });
  return serialize(statements) as unknown as StatementSummary[];
}

export async function deleteStatement(id: string) {
  return prisma.finSightStatement.delete({ where: { id } });
}