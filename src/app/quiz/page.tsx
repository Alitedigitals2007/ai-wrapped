import type { Metadata } from "next";
import QuizCreatorClient from "@/components/quiz/quiz-creator";

export const metadata: Metadata = {
  title: "Create a 'Who Knows Me Best?' Quiz",
  description:
    "Write your own questions, share the code, and see which friend knows you best.",
};

export default function QuizPage() {
  return <QuizCreatorClient />;
}