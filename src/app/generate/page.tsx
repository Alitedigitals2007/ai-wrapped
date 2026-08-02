import type { Metadata } from "next";
import GenerateClient from "@/components/generate/wizard";

export const metadata: Metadata = {
  title: "Generate Your Wrapped",
  description:
    "Enter your username, choose your AI, paste its response, and get your AI personality Wrapped in minutes.",
};

export default function GeneratePage() {
  return <GenerateClient />;
}
