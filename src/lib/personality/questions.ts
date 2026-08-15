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
    emoji: ["A", "B", "C", "D", "E", "F"][i],
    weights,
  })),
});

export const QUESTIONS: Question[] = [
  // ── Social ──────────────────────────────────────────────
  mcq("s1", "Social Energy", "You walk into a room and don't know anyone. What do you naturally do?", [
    ["A", "Start talking to someone almost immediately", { extraversion: 95, assertiveness: 80 }],
    ["B", "Find one person who looks approachable", { extraversion: 70, agreeableness: 70 }],
    ["C", "Stay quiet and observe first", { extraversion: 20, selfAwareness: 65 }],
    ["D", "Wait for someone to approach me", { extraversion: 15, emotionalStability: 40 }],
  ]),
  mcq("s2", "Social Energy", "After a long week, what sounds most enjoyable?", [
    ["A", "Going out with friends", { extraversion: 90, riskTolerance: 65 }],
    ["B", "Hanging out with a few close people", { extraversion: 65, trustOrientation: 70 }],
    ["C", "Spending time alone", { extraversion: 15, independence: 75 }],
    ["D", "Depends on my mood", { adaptability: 80, selfAwareness: 60 }],
  ]),
  mcq("s3", "Stimulation", "Someone invites you somewhere at the last minute.", [
    ["A", "I'm probably going", { extraversion: 80, riskTolerance: 75 }],
    ["B", "I'll go if someone I know is going", { agreeableness: 75, extraversion: 60 }],
    ["C", "I'd rather have planned ahead", { conscientiousness: 80, emotionalStability: 45 }],
    ["D", "Probably not", { independence: 75, extraversion: 15 }],
  ]),
  mcq("s4", "Social Energy", "In a group conversation, you usually:", [
    ["A", "Lead the conversation", { assertiveness: 90, extraversion: 85 }],
    ["B", "Participate frequently", { extraversion: 70, assertiveness: 65 }],
    ["C", "Listen more than I speak", { empathy: 70, selfAwareness: 70 }],
    ["D", "Speak only when I have something important to add", { conscientiousness: 65, independence: 55 }],
  ]),

  // ── Decision Making ─────────────────────────────────────
  mcq("d1", "Decision Style", "You have an important decision to make tomorrow. What do you usually do?", [
    ["A", "Decide quickly and move", { assertiveness: 85, riskTolerance: 70 }],
    ["B", "Think through the major consequences", { conscientiousness: 85, emotionalStability: 65 }],
    ["C", "Ask several people for advice", { agreeableness: 75, extraversion: 55 }],
    ["D", "Research until I feel confident", { conscientiousness: 90, independence: 50 }],
  ]),
  mcq("d2", "Independence", "A friend gives you advice you strongly disagree with.", [
    ["A", "Tell them directly", { conflictDirectness: 90, assertiveness: 85 }],
    ["B", "Explain why I disagree", { conflictDirectness: 80, openness: 70 }],
    ["C", "Listen but probably do what I want", { independence: 90, selfAwareness: 60 }],
    ["D", "Consider their perspective before deciding", { openness: 85, agreeableness: 70 }],
  ]),
  mcq("d3", "Risk Tolerance", "Two opportunities: one safe with moderate rewards, one risky with a much bigger reward. You:", [
    ["A", "Choose the safe one", { emotionalStability: 75, riskTolerance: 15 }],
    ["B", "Choose the risky one", { riskTolerance: 90, ambition: 85 }],
    ["C", "Mix a bit of both", { riskTolerance: 55, adaptability: 75 }],
    ["D", "Take time to evaluate the odds", { conscientiousness: 80, riskTolerance: 45 }],
  ]),
  mcq("d4", "Decision Style", "When making decisions, what matters most?", [
    ["A", "Facts and evidence", { conscientiousness: 80, emotionalStability: 55 }],
    ["B", "How I feel about it", { openness: 65, selfAwareness: 70 }],
    ["C", "What will affect other people", { empathy: 90, agreeableness: 85 }],
    ["D", "What gives the best long-term result", { ambition: 85, conscientiousness: 75 }],
  ]),
  mcq("d5", "Accountability", "You realize you've made a bad decision.", [
    ["A", "Admit it quickly", { selfAwareness: 90, resilience: 70 }],
    ["B", "Try to fix the situation first", { resilience: 80, conscientiousness: 70 }],
    ["C", "Keep going because I've already invested", { riskTolerance: 55, independence: 60 }],
    ["D", "Ask someone what I should do", { agreeableness: 70, trustOrientation: 70 }],
  ]),

  // ── Pressure & Failure ──────────────────────────────────
  mcq("p1", "Resilience", "You work hard on something and it completely fails. Your first reaction is:", [
    ["A", "Try again immediately", { resilience: 85, ambition: 80 }],
    ["B", "Figure out what went wrong", { conscientiousness: 80, emotionalStability: 70 }],
    ["C", "Feel frustrated and take a break", { emotionalStability: 30, resilience: 40 }],
    ["D", "Wonder whether it was worth doing", { selfAwareness: 60, resilience: 30 }],
  ]),
  mcq("p2", "Sensitivity to Evaluation", "Someone publicly points out your mistake.", [
    ["A", "Defend myself", { assertiveness: 75, emotionalStability: 45 }],
    ["B", "Accept it if they're right", { selfAwareness: 85, emotionalStability: 75 }],
    ["C", "Feel embarrassed but stay quiet", { emotionalStability: 30, assertiveness: 25 }],
    ["D", "Ask them to explain what I did wrong", { openness: 70, assertiveness: 65 }],
  ]),
  mcq("p3", "Pressure Response", "When you're under a lot of pressure, you tend to:", [
    ["A", "Become more focused", { conscientiousness: 85, emotionalStability: 75 }],
    ["B", "Become quieter", { extraversion: 20, selfAwareness: 60 }],
    ["C", "Get easily irritated", { emotionalStability: 20 }],
    ["D", "Avoid the problem temporarily", { adaptability: 45, resilience: 30 }],
    ["E", "Look for someone to help me", { trustOrientation: 75, agreeableness: 70 }],
  ]),
  mcq("p4", "Accountability", "You miss a big goal because you procrastinated. What do you think first?", [
    ["A", "\u201CI messed up.\u201D", { selfAwareness: 80, emotionalStability: 45 }],
    ["B", "\u201CHow do I make sure this never happens again?\u201D", { resilience: 80, conscientiousness: 75 }],
    ["C", "\u201CI had too much going on.\u201D", { emotionalStability: 40 }],
    ["D", "\u201CI'll just try again.\u201D", { resilience: 90, riskTolerance: 55 }],
  ]),
  mcq("p5", "Top Concern", "Which bothers you more?", [
    ["A", "Failing", { ambition: 75, emotionalStability: 40 }],
    ["B", "Disappointing people", { empathy: 80, agreeableness: 85 }],
    ["C", "Losing control", { independence: 70, conscientiousness: 60 }],
    ["D", "Wasting time", { conscientiousness: 80, ambition: 65 }],
    ["E", "Being judged", { emotionalStability: 30, selfAwareness: 50 }],
  ]),

  // ── Relationships & Trust ───────────────────────────────
  mcq("r1", "Attachment Style", "A close friend suddenly becomes distant. What do you do?", [
    ["A", "Ask them directly what's wrong", { conflictDirectness: 75, empathy: 70 }],
    ["B", "Give them space", { independence: 60, agreeableness: 65 }],
    ["C", "Try to figure out what I did", { selfAwareness: 80, empathy: 60 }],
    ["D", "Wait for them to come to me", { emotionalStability: 50, assertiveness: 35 }],
  ]),
  mcq("r2", "Trust & Loyalty", "Someone you trust tells you something private. You:", [
    ["A", "Keep it completely private", { trustOrientation: 60, agreeableness: 75 }],
    ["B", "Tell only someone I also trust", { empathy: 60, trustOrientation: 50 }],
    ["C", "Depends on what the information is", { adaptability: 65, openness: 55 }],
    ["D", "Mention it if necessary", { openness: 45, riskTolerance: 55 }],
  ]),
  mcq("r3", "Forgiveness", "Someone apologizes after hurting you.", [
    ["A", "Forgive quickly", { agreeableness: 85, empathy: 80 }],
    ["B", "Forgive but become more cautious", { trustOrientation: 35, selfAwareness: 70 }],
    ["C", "Need time before forgiving", { selfAwareness: 70, emotionalStability: 55 }],
    ["D", "Depends on what they did", { openness: 60, empathy: 55 }],
  ]),
  mcq("r4", "Trust Orientation", "What makes you trust someone most?", [
    ["A", "Their words", { trustOrientation: 60, openness: 55 }],
    ["B", "Their consistency", { conscientiousness: 75, trustOrientation: 55 }],
    ["C", "What they've done for me", { trustOrientation: 70, agreeableness: 60 }],
    ["D", "How they treat other people", { empathy: 85, agreeableness: 80 }],
  ]),
  mcq("r5", "Empathy & Jealousy", "A friend succeeds at something you wanted. Your honest reaction is closest to:", [
    ["A", "I'm genuinely happy for them", { empathy: 85, agreeableness: 80 }],
    ["B", "Happy for them, but I may feel disappointed in myself", { selfAwareness: 65, ambition: 60 }],
    ["C", "Motivated to work harder", { ambition: 90, resilience: 80 }],
    ["D", "I might feel jealous", { selfAwareness: 55, emotionalStability: 40 }],
    ["E", "It depends on how close we are", { adaptability: 50, empathy: 55 }],
  ]),

  // ── Values & Character ──────────────────────────────────
  mcq("v1", "Integrity", "You discover you could get away with something dishonest and nobody would know. What matters most?", [
    ["A", "I'd still do the right thing", { selfAwareness: 80, conscientiousness: 75 }],
    ["B", "The risk isn't worth it", { emotionalStability: 65, riskTolerance: 35 }],
    ["C", "I'd consider it if the payoff is big", { ambition: 65, riskTolerance: 70 }],
    ["D", "It would weigh on me", { empathy: 70, agreeableness: 65 }],
  ]),
  mcq("v2", "Loyalty vs. Honesty", "A friend does something wrong and asks you to cover for them. You:", [
    ["A", "Cover for them", { agreeableness: 75, trustOrientation: 70 }],
    ["B", "Refuse but stay quiet", { independence: 75, conflictDirectness: 45 }],
    ["C", "Tell them to come clean", { conflictDirectness: 80, resilience: 65 }],
    ["D", "Support them but not the cover-up", { empathy: 70, selfAwareness: 75 }],
  ]),
  mcq("v3", "Life Preference", "Which life sounds most attractive?", [
    ["A", "Success with a lot of pressure", { ambition: 90, riskTolerance: 70 }],
    ["B", "A peaceful life with moderate success", { emotionalStability: 80, agreeableness: 55 }],
    ["C", "Freedom with uncertainty", { independence: 85, riskTolerance: 75 }],
    ["D", "Stability with less freedom", { conscientiousness: 75, emotionalStability: 70 }],
  ]),
  mcq("v4", "Core Value", "Which matters most to you?", [
    ["A", "Loyalty", { trustOrientation: 80, agreeableness: 70 }],
    ["B", "Honesty", { conscientiousness: 70, conflictDirectness: 65 }],
    ["C", "Freedom", { independence: 85, riskTolerance: 60 }],
    ["D", "Achievement", { ambition: 85, conscientiousness: 70 }],
    ["E", "Respect", { assertiveness: 55, emotionalStability: 55 }],
    ["F", "Kindness", { empathy: 90, agreeableness: 90 }],
    ["G", "Knowledge", { openness: 90, ambition: 60 }],
  ]),
  mcq("v5", "Power Orientation", "If you had a lot of power over a group, what would be most important to you?", [
    ["A", "Getting results", { ambition: 85, conscientiousness: 70 }],
    ["B", "Keeping everyone happy", { agreeableness: 85, empathy: 75 }],
    ["C", "Making fair decisions", { conscientiousness: 75, selfAwareness: 65 }],
    ["D", "Maintaining control", { independence: 65, assertiveness: 70 }],
    ["E", "Giving people freedom", { independence: 85, openness: 75 }],
  ]),

  // ── Conflict ────────────────────────────────────────────
  mcq("c1", "Conflict Style", "Someone strongly disagrees with you.", [
    ["A", "Debate them", { conflictDirectness: 90, assertiveness: 80 }],
    ["B", "Try to understand their reasoning", { openness: 85, empathy: 70 }],
    ["C", "Agree to disagree", { agreeableness: 65, adaptability: 60 }],
    ["D", "Avoid the argument", { conflictDirectness: 15, emotionalStability: 45 }],
    ["E", "Try to convince them", { assertiveness: 75, ambition: 65 }],
  ]),
  mcq("c2", "Conflict Style", "During an argument, what are you most likely to do?", [
    ["A", "Become more logical", { emotionalStability: 75, conscientiousness: 65 }],
    ["B", "Become emotional", { empathy: 60, emotionalStability: 25 }],
    ["C", "Become quiet", { extraversion: 25, conflictDirectness: 25 }],
    ["D", "Become defensive", { emotionalStability: 30, selfAwareness: 40 }],
    ["E", "Try to end the argument", { agreeableness: 60, conflictDirectness: 35 }],
  ]),
  mcq("c3", "Conflict Style", "Someone insults you during an argument. What matters most?", [
    ["A", "Defending myself", { assertiveness: 85, emotionalStability: 40 }],
    ["B", "Staying calm", { emotionalStability: 85, selfAwareness: 75 }],
    ["C", "Proving them wrong", { conflictDirectness: 75, ambition: 60 }],
    ["D", "Ending the conversation", { agreeableness: 55, conflictDirectness: 30 }],
  ]),
  mcq("c4", "Conflict Style", "If you realize you're wrong during an argument:", [
    ["A", "Admit it immediately", { selfAwareness: 90, conflictDirectness: 70 }],
    ["B", "Think about it before admitting it", { conscientiousness: 70, emotionalStability: 60 }],
    ["C", "Change my position quietly", { adaptability: 75, selfAwareness: 60 }],
    ["D", "Find another way to explain my point", { assertiveness: 60, resilience: 55 }],
  ]),
  mcq("c5", "Conflict Style", "Which is worse?", [
    ["A", "Someone misunderstanding me", { empathy: 60, selfAwareness: 55 }],
    ["B", "Someone disrespecting me", { assertiveness: 70, conflictDirectness: 65 }],
    ["C", "Someone ignoring me", { extraversion: 50, emotionalStability: 45 }],
    ["D", "Someone lying to me", { trustOrientation: 70, conscientiousness: 60 }],
    ["E", "Someone controlling me", { independence: 90, assertiveness: 65 }],
  ]),

  // ── Life Preferences ────────────────────────────────────
  mcq("l1", "Life Direction", "Which life sounds most attractive?", [
    ["A", "Wealthy and influential", { ambition: 90, riskTolerance: 70 }],
    ["B", "Free and adventurous", { independence: 85, riskTolerance: 80 }],
    ["C", "Stable and peaceful", { emotionalStability: 80, conscientiousness: 60 }],
    ["D", "Highly successful and respected", { ambition: 85, assertiveness: 65 }],
    ["E", "Surrounded by people I love", { agreeableness: 85, empathy: 80 }],
  ]),
  mcq("l2", "World View", "You would rather have a life that is:", [
    ["A", "Predictable", { conscientiousness: 80, emotionalStability: 75 }],
    ["B", "Exciting", { riskTolerance: 85, openness: 80 }],
    ["C", "Meaningful", { empathy: 75, selfAwareness: 70 }],
    ["D", "Successful", { ambition: 85, assertiveness: 60 }],
    ["E", "Free", { independence: 90, riskTolerance: 70 }],
  ]),
  mcq("l3", "Motivation", "What motivates you most?", [
    ["A", "Achievement", { ambition: 90, conscientiousness: 65 }],
    ["B", "Recognition", { extraversion: 60, assertiveness: 55 }],
    ["C", "Money", { ambition: 70, riskTolerance: 60 }],
    ["D", "Freedom", { independence: 85, openness: 60 }],
    ["E", "Helping people", { empathy: 90, agreeableness: 85 }],
    ["F", "Curiosity", { openness: 90, selfAwareness: 60 }],
    ["G", "Competition", { assertiveness: 75, ambition: 75 }],
    ["H", "Security", { conscientiousness: 75, emotionalStability: 75 }],
    ["I", "Love / belonging", { agreeableness: 85, extraversion: 60 }],
  ]),
  mcq("l4", "Openness", "When you meet an unfamiliar idea that challenges your views, you:", [
    ["A", "Get curious and dig in", { openness: 90, selfAwareness: 65 }],
    ["B", "Respectfully hear it out", { agreeableness: 70, openness: 65 }],
    ["C", "Keep my views unless proven wrong", { conscientiousness: 65, independence: 60 }],
    ["D", "Reject it if it clashes with my values", { emotionalStability: 55, openness: 20 }],
  ]),

  // ── Self-Perception ─────────────────────────────────────
  mcq("sp1", "Self Awareness", "People often describe you as… (pick the closest)", [
    ["A", "Driven and relentless", { ambition: 85, assertiveness: 65 }],
    ["B", "Calm and easygoing", { emotionalStability: 80, agreeableness: 65 }],
    ["C", "Thoughtful and curious", { openness: 80, selfAwareness: 75 }],
    ["D", "Warm and caring", { empathy: 85, agreeableness: 80 }],
    ["E", "Quick and spontaneous", { adaptability: 75, riskTolerance: 65 }],
  ]),
  mcq("sp2", "Independence", "You've been going it alone on a project but it's slow. You:", [
    ["A", "Keep going solo — I trust my pace", { independence: 90, conscientiousness: 60 }],
    ["B", "Ask for help to speed things up", { agreeableness: 75, adaptability: 65 }],
    ["C", "Rebalance: do key parts alone, delegate the rest", { adaptability: 80, conscientiousness: 70 }],
    ["D", "Reflect on whether I even need others", { selfAwareness: 75, independence: 70 }],
  ]),

  // ── Open-ended (fed to the LLM for the narrative) ───────
  {
    type: "open",
    id: "o1",
    section: "About You",
    text: "What is your biggest strength?",
    placeholder: "e.g. Staying calm in chaos, seeing patterns, making people feel heard…",
    maxLength: 300,
  },
  {
    type: "open",
    id: "o2",
    section: "About You",
    text: "What is your biggest weakness?",
    placeholder: "e.g. Overthinking, people-pleasing, procrastinating…",
    maxLength: 300,
  },
  {
    type: "open",
    id: "o3",
    section: "About You",
    text: "When people misunderstand you, what do they usually get wrong?",
    placeholder: "e.g. They think I'm cold, but I'm just private…",
    maxLength: 300,
  },
  {
    type: "open",
    id: "o4",
    section: "About You",
    text: "If your closest friend described you in three words, what would they say?",
    placeholder: "e.g. Loyal, curious, steady",
    maxLength: 120,
  },
  {
    type: "open",
    id: "o5",
    section: "About You",
    text: "If money wasn't a problem, what would you spend most of your time doing?",
    placeholder: "e.g. Traveling, building things, studying, helping others…",
    maxLength: 300,
  },
  {
    type: "open",
    id: "o6",
    section: "About You",
    text: "What is something you would never want to become?",
    placeholder: "e.g. Bitter, dishonest, stagnant, lonely…",
    maxLength: 300,
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