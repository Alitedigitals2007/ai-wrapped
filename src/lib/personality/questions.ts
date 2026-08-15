import type { Dimension } from "./dimensions";

export type OptionWeight = Partial<Record<Dimension, number>>;

export interface QuestionOption {
  key: string;
  label: string;
  emoji?: string;
  weights: OptionWeight;
}

export interface MCQQuestion {
  type: "mcq";
  id: string;
  section: string;
  text: string;
  options: QuestionOption[];
}

export interface OpenQuestion {
  type: "open";
  id: string;
  section: string;
  text: string;
  placeholder?: string;
  maxLength?: number;
}

export type Question = MCQQuestion | OpenQuestion;

const mcq = (
  id: string,
  section: string,
  text: string,
  options: [string, string, OptionWeight][]
): MCQQuestion => ({
  type: "mcq",
  id,
  section,
  text,
  options: options.map(([key, label, weights], i) => ({
    key,
    label,
    emoji: ["A", "B", "C", "D", "E", "F", "G", "H", "I"][i],
    weights,
  })),
});

export const QUESTIONS: Question[] = [
  mcq("s1", "Social Energy", "You walk into a room full of strangers. What do you do?", [
    ["A", "Start chatting", { extraversion: 95, assertiveness: 80 }],
    ["B", "Find one friendly face", { extraversion: 70, agreeableness: 70 }],
    ["C", "Observe first", { extraversion: 20, selfAwareness: 65 }],
    ["D", "Wait to be approached", { extraversion: 15, emotionalStability: 40 }],
  ]),
  mcq("s2", "Social Energy", "After a long week, you want:", [
    ["A", "A night out", { extraversion: 90, riskTolerance: 65 }],
    ["B", "A few close friends", { extraversion: 65, trustOrientation: 70 }],
    ["C", "Time alone", { extraversion: 15, independence: 75 }],
    ["D", "Whatever feels right", { adaptability: 80, selfAwareness: 60 }],
  ]),
  mcq("d3", "Risk Tolerance", "Safe reward vs. a big risky one. You pick:", [
    ["A", "The safe one", { emotionalStability: 75, riskTolerance: 15 }],
    ["B", "The risky one", { riskTolerance: 90, ambition: 85 }],
    ["C", "A mix of both", { riskTolerance: 55, adaptability: 75 }],
    ["D", "Study the odds first", { conscientiousness: 80, riskTolerance: 45 }],
  ]),
  mcq("d4", "Decision Style", "What guides your decisions most?", [
    ["A", "Facts", { conscientiousness: 80, emotionalStability: 55 }],
    ["B", "Feelings", { openness: 65, selfAwareness: 70 }],
    ["C", "Impact on people", { empathy: 90, agreeableness: 85 }],
    ["D", "Long-term payoff", { ambition: 85, conscientiousness: 75 }],
  ]),
  mcq("d5", "Accountability", "You made a bad call. You:", [
    ["A", "Own it fast", { selfAwareness: 90, resilience: 70 }],
    ["B", "Fix it first", { resilience: 80, conscientiousness: 70 }],
    ["C", "Stick with it", { riskTolerance: 55, independence: 60 }],
    ["D", "Ask for help", { agreeableness: 70, trustOrientation: 70 }],
  ]),
  mcq("p1", "Resilience", "Something you built fails. First move:", [
    ["A", "Try again now", { resilience: 85, ambition: 80 }],
    ["B", "Find the cause", { conscientiousness: 80, emotionalStability: 70 }],
    ["C", "Step back, breathe", { emotionalStability: 30, resilience: 40 }],
    ["D", "Question if it's worth it", { selfAwareness: 60, resilience: 30 }],
  ]),
  mcq("p3", "Pressure Response", "Under heavy pressure, you:", [
    ["A", "Lock in", { conscientiousness: 85, emotionalStability: 75 }],
    ["B", "Go quiet", { extraversion: 20, selfAwareness: 60 }],
    ["C", "Get snappy", { emotionalStability: 20 }],
    ["D", "Reach out for help", { trustOrientation: 75, agreeableness: 70 }],
  ]),
  mcq("r1", "Attachment Style", "A close friend goes distant. You:", [
    ["A", "Ask what's wrong", { conflictDirectness: 75, empathy: 70 }],
    ["B", "Give them space", { independence: 60, agreeableness: 65 }],
    ["C", "Wonder what you did", { selfAwareness: 80, empathy: 60 }],
    ["D", "Wait for them", { emotionalStability: 50, assertiveness: 35 }],
  ]),
  mcq("r4", "Trust Orientation", "What earns your trust most?", [
    ["A", "Their words", { trustOrientation: 60, openness: 55 }],
    ["B", "Their consistency", { conscientiousness: 75, trustOrientation: 55 }],
    ["C", "What they've done", { trustOrientation: 70, agreeableness: 60 }],
    ["D", "How they treat others", { empathy: 85, agreeableness: 80 }],
  ]),
  mcq("r5", "Empathy", "A friend wins what you wanted. Honest reaction:", [
    ["A", "Truly happy for them", { empathy: 85, agreeableness: 80 }],
    ["B", "Happy, a bit down too", { selfAwareness: 65, ambition: 60 }],
    ["C", "Motivated to work harder", { ambition: 90, resilience: 80 }],
    ["D", "A little jealous", { selfAwareness: 55, emotionalStability: 40 }],
  ]),
  mcq("v1", "Integrity", "You could get away with a small dishonest win. You:", [
    ["A", "Do the right thing", { selfAwareness: 80, conscientiousness: 75 }],
    ["B", "Not worth the risk", { emotionalStability: 65, riskTolerance: 35 }],
    ["C", "Consider it if big enough", { ambition: 65, riskTolerance: 70 }],
    ["D", "It would weigh on me", { empathy: 70, agreeableness: 65 }],
  ]),
  mcq("v4", "Core Value", "What matters most to you?", [
    ["A", "Loyalty", { trustOrientation: 80, agreeableness: 70 }],
    ["B", "Honesty", { conscientiousness: 70, conflictDirectness: 65 }],
    ["C", "Freedom", { independence: 85, riskTolerance: 60 }],
    ["D", "Achievement", { ambition: 85, conscientiousness: 70 }],
    ["E", "Respect", { assertiveness: 55, emotionalStability: 55 }],
    ["F", "Kindness", { empathy: 90, agreeableness: 90 }],
    ["G", "Knowledge", { openness: 90, ambition: 60 }],
  ]),
  mcq("c1", "Conflict Style", "Someone strongly disagrees. You:", [
    ["A", "Debate them", { conflictDirectness: 90, assertiveness: 80 }],
    ["B", "Understand their view", { openness: 85, empathy: 70 }],
    ["C", "Agree to disagree", { agreeableness: 65, adaptability: 60 }],
    ["D", "Avoid it", { conflictDirectness: 15, emotionalStability: 45 }],
    ["E", "Win them over", { assertiveness: 75, ambition: 65 }],
  ]),
  mcq("l4", "Openness", "A new idea challenges your views. You:", [
    ["A", "Get curious, dig in", { openness: 90, selfAwareness: 65 }],
    ["B", "Hear it out", { agreeableness: 70, openness: 65 }],
    ["C", "Need proof to shift", { conscientiousness: 65, independence: 60 }],
    ["D", "Reject what clashes", { emotionalStability: 55, openness: 20 }],
  ]),
  mcq("sp1", "Self Awareness", "People describe you as:", [
    ["A", "Driven", { ambition: 85, assertiveness: 65 }],
    ["B", "Easygoing", { emotionalStability: 80, agreeableness: 65 }],
    ["C", "Thoughtful", { openness: 80, selfAwareness: 75 }],
    ["D", "Warm", { empathy: 85, agreeableness: 80 }],
    ["E", "Spontaneous", { adaptability: 75, riskTolerance: 65 }],
  ]),

  {
    type: "open",
    id: "o1",
    section: "About You",
    text: "Your biggest strength?",
    placeholder: "e.g. Staying calm, seeing patterns, listening…",
    maxLength: 200,
  },
  {
    type: "open",
    id: "o2",
    section: "About You",
    text: "Your biggest weakness?",
    placeholder: "e.g. Overthinking, people-pleasing, procrastinating…",
    maxLength: 200,
  },
  {
    type: "open",
    id: "o3",
    section: "About You",
    text: "What do people get wrong about you?",
    placeholder: "e.g. That I'm cold, when I'm just private…",
    maxLength: 200,
  },
];

export const MCQ_COUNT = QUESTIONS.filter((q) => q.type === "mcq").length;
export const TOTAL_COUNT = QUESTIONS.length;

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function sectionsFor(q: Question): string {
  return q.section;
}