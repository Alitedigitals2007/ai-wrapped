import { notFound } from "next/navigation";
import { getStatement } from "@/lib/finsight/actions";
import { StatementNav } from "@/components/finsight/statement-nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) return { title: "Statement Not Found" };
  return {
    title: `${statement.accountName || "Financial Statement"} — FinSight`,
    description: `Financial analysis for ${statement.periodStart ? new Date(statement.periodStart).toLocaleDateString() : "statement"}`,
  };
}

export default async function StatementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) notFound();
  return (
    <div className="min-h-screen">
      <StatementNav statement={statement} />
      <main className="pt-20 pb-16 px-4">{children}</main>
    </div>
  );
}