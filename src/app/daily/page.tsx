import type { Metadata } from "next";
import DailyPromptClient from "@/components/quiz/daily-prompt";

export const metadata: Metadata = {
  title: "Today's Question — Aura",
  description: "One question a day. Answer it, get your daily read, and come back tomorrow.",
};

export default function DailyPage() {
  return <DailyPromptClient />;
}