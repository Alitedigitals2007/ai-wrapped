import type { Metadata } from "next";
import GenerateClient from "@/components/generate/wizard";
import { WRAPPED_FEATURE_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Generate Your ${WRAPPED_FEATURE_NAME}`,
  description:
    "Enter your username, choose your AI, paste its response, and get your AI personality Wrapped in minutes.",
};

export default function GeneratePage() {
  return <GenerateClient />;
}
