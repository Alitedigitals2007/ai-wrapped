import type { Metadata } from "next";
import PersonalityTestClient from "@/components/personality/test-client";

export const metadata: Metadata = {
  title: "Personality Test",
  description:
    "Answer a short scenario-based questionnaire and get a beautiful, sharable personality report — 15 dimensions, powered by AI.",
};

export default function PersonalityTestPage() {
  return <PersonalityTestClient />;
}