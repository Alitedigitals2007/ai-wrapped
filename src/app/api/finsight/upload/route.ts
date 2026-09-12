import { uploadAndAnalyzeStatement } from "@/lib/finsight/actions";

export const maxDuration = 60;

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await uploadAndAnalyzeStatement(formData);
  return Response.json(result);
}