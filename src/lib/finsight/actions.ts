"use server";

import { prisma } from "@/lib/prisma";
import { processExcelFile, ProcessedStatement } from "@/lib/finsight/processor";
import { Decimal } from "@prisma/client/runtime/library";

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
        status: "completed",
        processedAt: new Date(),
        transactions: {
          create: processed.transactions.map(t => ({
            transactionDate: t.date,
            valueDate: t.valueDate,
            description: t.description,
            debit: new Decimal(t.debit),
            credit: new Decimal(t.credit),
            balance: t.balance ? new Decimal(t.balance) : null,
            channel: t.channel,
            reference: t.reference,
            category: t.description ? categorizeDescription(t.description) : "Other",
            normalizedDescription: t.description,
          })),
        },
        monthlyMetrics: {
          create: processed.monthlyMetrics.map(m => ({
            month: m.month,
            totalCredit: new Decimal(m.totalCredit),
            totalDebit: new Decimal(m.totalDebit),
            netFlow: new Decimal(m.netFlow),
            transactionCount: m.transactionCount,
            averageBalance: m.averageBalance ? new Decimal(m.averageBalance) : null,
            endingBalance: m.endingBalance ? new Decimal(m.endingBalance) : null,
          })),
        },
        insights: {
          create: processed.insights.map(i => ({
            type: i.type,
            severity: i.severity,
            title: i.title,
            observation: i.observation,
            explanation: i.explanation,
            recommendation: i.recommendation,
            confidence: i.confidence ? new Decimal(i.confidence) : null,
          })),
        },
        riskScore: {
          create: {
            overallScore: new Decimal(processed.riskScore.overallScore),
            liquidityScore: new Decimal(processed.riskScore.liquidityScore),
            spendingScore: new Decimal(processed.riskScore.spendingScore),
            consistencyScore: new Decimal(processed.riskScore.consistencyScore),
            anomalyScore: new Decimal(processed.riskScore.anomalyScore),
            concentrationScore: new Decimal(processed.riskScore.concentrationScore),
          },
        },
      },
    });
    
    return { success: true, statementId: statement.id };
  } catch (error) {
    console.error("Upload error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process file" 
    };
  }
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

export async function getStatement(id: string) {
  return prisma.finSightStatement.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { transactionDate: "asc" } },
      monthlyMetrics: { orderBy: { month: "asc" } },
      insights: { orderBy: { createdAt: "desc" } },
      riskScore: true,
    },
  });
}

export async function getStatements() {
  return prisma.finSightStatement.findMany({
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
}

export async function deleteStatement(id: string) {
  return prisma.finSightStatement.delete({ where: { id } });
}