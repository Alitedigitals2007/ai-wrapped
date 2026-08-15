export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface FriendQuiz {
  id: string;
  creatorName: string;
  title: string;
  questions: QuizQuestion[];
  code: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  playerName: string;
  answers: number[];
  score: number;
  total: number;
  createdAt: string;
}

export const QUIZ_QUESTION_COUNT = 6;
export const QUIZ_OPTIONS_COUNT = 4;

export const TEMPLATE_QUESTIONS: { text: string; options: string[] }[] = [
  { text: "What would I order at a restaurant?", options: ["Pizza", "Burger", "Sushi", "Something new"] },
  { text: "Where would you find me on a Saturday?", options: ["Party 🎉", "Home 🛋️", "Outside 🌳", "With friends 👯"] },
  { text: "What am I most afraid of?", options: ["Heights", "Spiders", "Failure", "Losing people"] },
  { text: "What's my go-to mood?", options: ["Always laughing", "Deep thinker", "Low-key chill", "Chaotic energy"] },
  { text: "What would I do with a million naira?", options: ["Invest it", "Spend it", "Give it away", "Travel the world"] },
  { text: "What's my best quality?", options: ["Honesty", "Loyalty", "Fun energy", "Smart decisions"] },
];

export function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function buildQuestions(
  entries: { text: string; options: string[]; correctIndex: number }[]
): QuizQuestion[] {
  return entries
    .filter((q) => q.text.trim().length > 0)
    .map((q, i) => ({
      id: `q${i + 1}`,
      text: q.text.trim().slice(0, 120),
      options: q.options.map((o) => o.trim().slice(0, 60)),
      correctIndex: Math.max(0, Math.min(q.correctIndex, q.options.length - 1)),
    }));
}