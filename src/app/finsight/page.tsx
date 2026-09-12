import { getStatements } from "@/lib/finsight/actions";
import { FinSightLanding } from "@/components/finsight/finsight-landing";

export const dynamic = "force-dynamic";

export default async function FinSightLandingPage() {
  const statements = await getStatements();
  return <FinSightLanding statements={statements} />;
}