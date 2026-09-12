import { notFound } from "next/navigation";
import { getStatement } from "@/lib/finsight/actions";
import { RiskPage } from "@/components/finsight/risk-page";

export default async function RiskPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) notFound();
  return <RiskPage statement={statement} />;
}