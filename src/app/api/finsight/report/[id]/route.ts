import { getStatement } from "@/lib/finsight/actions";
import { formatCurrency } from "@/lib/finsight/processor";
import { format } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const statement = await getStatement(id);
  
  if (!statement) {
    return new Response("Statement not found", { status: 404 });
  }

  const totalIn = statement.totalCredit?.toNumber() || 0;
  const totalOut = statement.totalDebit?.toNumber() || 0;
  const netFlow = totalIn - totalOut;
  const closingBal = statement.closingBalance?.toNumber() || 0;
  const closingBalClass = closingBal >= 0 ? "positive" : "negative";
  const risk = statement.riskScore;
  const overallScore = risk?.overallScore?.toNumber() || 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FinSight Report - ${statement.accountName || "Financial Statement"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #10b981; margin: 0; font-size: 2.5rem; }
    .header .subtitle { color: #6b7280; margin-top: 8px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .card { background: #f9fafb; border-radius: 12px; padding: 16px; }
    .card .label { font-size: 0.875rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .card .value { font-size: 1.5rem; font-weight: 700; margin-top: 4px; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; color: #374151; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.875rem; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>FinSight Financial Analysis</h1>
    <div class="subtitle">${statement.accountName || "Financial Statement"}</div>
    <div class="subtitle">${format(statement.periodStart || statement.uploadedAt, "MMMM d, yyyy")} — ${format(statement.periodEnd || statement.uploadedAt, "MMMM d, yyyy")}</div>
  </div>

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="grid">
      <div class="card"><div class="label">Money In</div><div class="value positive">${formatCurrency(totalIn)}</div></div>
      <div class="card"><div class="label">Money Out</div><div class="value negative">${formatCurrency(totalOut)}</div></div>
      <div class="card"><div class="label">Net Flow</div><div class="value ${netFlow >= 0 ? "positive" : "negative"}">${formatCurrency(netFlow)}</div></div>
      <div class="card"><div class="label">Closing Balance</div><div class="value ${closingBalClass}">${formatCurrency(closingBal)}</div></div>
      <div class="card"><div class="label">Transactions</div><div class="value">${(statement.creditCount || 0) + (statement.debitCount || 0)}</div></div>
      <div class="card"><div class="label">Health Score</div><div class="value">${Math.round(overallScore)}/100</div></div>
    </div>
  </div>

  ${risk ? `
  <div class="section">
    <h2>Risk Assessment</h2>
    <div class="grid">
      <div class="card"><div class="label">Overall</div><div class="value">${Math.round(risk.overallScore.toNumber())}/100</div></div>
      <div class="card"><div class="label">Liquidity</div><div class="value">${Math.round(risk.liquidityScore.toNumber())}/100</div></div>
      <div class="card"><div class="label">Spending Concentration</div><div class="value">${Math.round(risk.spendingScore.toNumber())}/100</div></div>
      <div class="card"><div class="label">Consistency</div><div class="value">${Math.round(risk.consistencyScore.toNumber())}/100</div></div>
      <div class="card"><div class="label">Anomalies</div><div class="value">${Math.round(risk.anomalyScore.toNumber())}/100</div></div>
      <div class="card"><div class="label">Balance Retention</div><div class="value">${Math.round(risk.concentrationScore.toNumber())}/100</div></div>
    </div>
  </div>
  ` : ""}

  <div class="section">
    <h2>Monthly Cash Flow</h2>
    <table>
      <thead>
        <tr><th>Month</th><th>Money In</th><th>Money Out</th><th>Net Flow</th><th>Transactions</th><th>Closing Balance</th></tr>
      </thead>
      <tbody>
        ${statement.monthlyMetrics.map(m => `
          <tr>
            <td>${format(m.month, "MMM yyyy")}</td>
            <td class="positive">${formatCurrency(m.totalCredit.toNumber())}</td>
            <td class="negative">${formatCurrency(m.totalDebit.toNumber())}</td>
            <td class="${m.netFlow.toNumber() >= 0 ? "positive" : "negative"}">${formatCurrency(m.netFlow.toNumber())}</td>
            <td>${m.transactionCount}</td>
            <td>${m.endingBalance ? formatCurrency(m.endingBalance.toNumber()) : "—"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Top Insights</h2>
    ${statement.insights.length > 0 ? `
      <table>
        <thead>
          <tr><th>Type</th><th>Severity</th><th>Title</th><th>Observation</th><th>Confidence</th></tr>
        </thead>
        <tbody>
          ${statement.insights.map(i => `
            <tr>
              <td>${i.type.replace(/_/g, " ")}</td>
              <td>${i.severity}</td>
              <td>${i.title}</td>
              <td>${i.observation}</td>
              <td>${i.confidence ? i.confidence.toNumber().toFixed(0) + "%" : "—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : "<p>No insights detected.</p>"}
  </div>

  <div class="footer">
    <p>Generated by FinSight — Financial Statement Intelligence</p>
    <p>Report generated on ${format(new Date(), "MMMM d, yyyy")}</p>
    <p class="no-print">Print this page to PDF (Ctrl/Cmd + P) for a portable report.</p>
  </div>
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="finsight-report-${id}.html"`,
    },
  });
}