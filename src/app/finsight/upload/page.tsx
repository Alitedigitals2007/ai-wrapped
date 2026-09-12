import type { Metadata } from "next";
import { UploadForm } from "@/components/finsight/upload-form";

export const metadata: Metadata = {
  title: "Upload Statement — FinSight",
  description: "Upload your bank statement (Excel) for automated financial analysis.",
};

export default function UploadPage() {
  return <UploadForm />;
}