import { notFound } from "next/navigation";
import { getStatement } from "@/lib/finsight/actions";
import { InsightsPage } from "@/components/finsight/insights-page";

export default async function InsightsPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) notFound();
  return <InsightsPage statement={statement} />;
}