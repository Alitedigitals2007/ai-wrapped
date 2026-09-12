import { notFound } from "next/navigation";
import { getStatement } from "@/lib/finsight/actions";
import { ExecutiveDashboard } from "@/components/finsight/executive-dashboard";

export default async function ExecutivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) notFound();
  return <ExecutiveDashboard statement={statement} />;
}