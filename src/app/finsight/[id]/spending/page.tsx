import { notFound } from "next/navigation";
import { getStatement } from "@/lib/finsight/actions";
import { SpendingPage } from "@/components/finsight/spending-page";

export default async function SpendingPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const statement = await getStatement(id);
  if (!statement) notFound();
  return <SpendingPage statement={statement} />;
}