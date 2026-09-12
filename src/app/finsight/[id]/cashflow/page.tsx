import { notFound } from "next/navigation";
import { getStatement } from "@/lib/finsight/actions";
import { CashFlowPage } from "@/components/finsight/cashflow-page";

export default async function CashFlowPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) notFound();
  return <CashFlowPage statement={statement} />;
}