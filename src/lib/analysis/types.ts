export interface Profile {
  username: string;
  aiUsed: string;
  generatedDate: string;
}

export interface Personality {
  personalityType: string;
  aiArchetype: string;
  communicationStyle: string;
  thinkingStyle: string;
  learningStyle: string;
  decisionStyle: string;
  leadershipStyle: string;
  confidenceLevel: string;
  curiosityLevel: string;
  creativityLevel: string;
}

export interface Scores {
  creativity: number;
  leadership: number;
  communication: number;
  learning: number;
  productivity: number;
  problemSolving: number;
  criticalThinking: number;
  innovation: number;
  overall: number;
}

export interface Language {
  mostUsedWord: string;
  mostUsedPhrase: string;
  vocabularyLevel: string;
  writingStyle: string;
  promptStyle: string;
  questionStyle: string;
  averageComplexity: string;
}

export interface Interests {
  topTopics: string[];
  topSubjects: string[];
  favoriteDomain: string;
  mostDiscussedArea: string;
}

export interface Productivity {
  estimatedHoursSaved: string;
  mostCommonUse: string;
  researchLevel: string;
  writingLevel: string;
  codingLevel: string;
}

export interface Career {
  topMatch: string;
  secondMatch: string;
  thirdMatch: string;
}

export interface Fun {
  signaturePrompt: string;
  mostUnexpectedPrompt: string;
  biggestRabbitHole: string;
  wildestQuestion: string;
  mostCreativeMoment: string;
  funniestInsight: string;
}

export interface Prediction {
  nextSkill: string;
  nextChallenge: string;
  bookRecommendation: string;
  projectRecommendation: string;
  learningRecommendation: string;
}

export interface Analysis {
  profile: Profile;
  personality: Personality;
  scores: Scores;
  language: Language;
  interests: Interests;
  productivity: Productivity;
  career: Career;
  strengths: string[];
  improvement: string[];
  fun: Fun;
  achievements: string[];
  prediction: Prediction;
}

export interface WrappedSummary {
  username: string;
  aiUsed: string;
  aiArchetype: string;
  personalityType: string;
  topStrength: string;
  topInterest: string;
  bestBadge: string;
  overallScore: number;
}

export const SCORE_KEYS: { key: keyof Scores; label: string }[] = [
  { key: "creativity", label: "Creativity" },
  { key: "leadership", label: "Leadership" },
  { key: "communication", label: "Communication" },
  { key: "learning", label: "Learning" },
  { key: "productivity", label: "Productivity" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "criticalThinking", label: "Critical Thinking" },
  { key: "innovation", label: "Innovation" },
];

export const DEFAULT_ANALYSIS: Analysis = {
  profile: { username: "", aiUsed: "", generatedDate: "" },
  personality: {
    personalityType: "Balanced Thinker",
    aiArchetype: "Everyday Explorer",
    communicationStyle: "Thoughtful",
    thinkingStyle: "Analytical",
    learningStyle: "Hands-On",
    decisionStyle: "Balanced",
    leadershipStyle: "Collaborative",
    confidenceLevel: "Moderate",
    curiosityLevel: "High",
    creativityLevel: "High",
  },
  scores: {
    creativity: 70,
    leadership: 60,
    communication: 65,
    learning: 70,
    productivity: 60,
    problemSolving: 65,
    criticalThinking: 65,
    innovation: 65,
    overall: 65,
  },
  language: {
    mostUsedWord: "think",
    mostUsedPhrase: "What if",
    vocabularyLevel: "Rich",
    writingStyle: "Balanced",
    promptStyle: "Explorative",
    questionStyle: "Open-Ended",
    averageComplexity: "Moderate",
  },
  interests: {
    topTopics: ["AI", "Technology"],
    topSubjects: ["Artificial Intelligence"],
    favoriteDomain: "Technology",
    mostDiscussedArea: "AI",
  },
  productivity: {
    estimatedHoursSaved: "5 hours/week",
    mostCommonUse: "Learning new things",
    researchLevel: "Medium",
    writingLevel: "Medium",
    codingLevel: "Medium",
  },
  career: {
    topMatch: "Innovation Consultant",
    secondMatch: "Data Scientist",
    thirdMatch: "Product Designer",
  },
  strengths: ["Curiosity", "Adaptability", "Critical Thinking"],
  improvement: ["Focus", "Consistency", "Structured Planning"],
  fun: {
    signaturePrompt: "Explain this like I'm five",
    mostUnexpectedPrompt: "Something out of left field",
    biggestRabbitHole: "AI rabbit holes",
    wildestQuestion: "A deeply creative 'what if'",
    mostCreativeMoment: "Creative brainstorming sessions",
    funniestInsight: "You ask surprisingly funny questions",
  },
  achievements: ["Knowledge Seeker", "AI Power User", "Curious Mind"],
  prediction: {
    nextSkill: "Advanced Prompt Engineering",
    nextChallenge: "Building something end-to-end",
    bookRecommendation: "The Alignment Problem",
    projectRecommendation: "A personal AI-powered project",
    learningRecommendation: "Deep dive into agentic workflows",
  },
};

export function mergeAnalysis(raw: Partial<Analysis>): Analysis {
  const d = DEFAULT_ANALYSIS;

  const scores = { ...d.scores, ...(raw.scores ?? {}) } as Scores;
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  (Object.keys(scores) as (keyof Scores)[]).forEach((k) => {
    const v = scores[k];
    scores[k] = typeof v === "number" && Number.isFinite(v) ? clamp(v) : d.scores[k];
  });
  scores.overall = clamp(
    (scores.creativity +
      scores.leadership +
      scores.communication +
      scores.learning +
      scores.productivity +
      scores.problemSolving +
      scores.criticalThinking +
      scores.innovation) /
      8
  );

  return {
    profile: { ...d.profile, ...(raw.profile ?? {}) },
    personality: { ...d.personality, ...(raw.personality ?? {}) },
    scores,
    language: { ...d.language, ...(raw.language ?? {}) },
    interests: {
      ...d.interests,
      ...(raw.interests ?? {}),
      topTopics: Array.isArray(raw.interests?.topTopics)
        ? raw.interests!.topTopics.filter(Boolean).slice(0, 10)
        : d.interests.topTopics,
      topSubjects: Array.isArray(raw.interests?.topSubjects)
        ? raw.interests!.topSubjects.filter(Boolean).slice(0, 10)
        : d.interests.topSubjects,
    },
    productivity: { ...d.productivity, ...(raw.productivity ?? {}) },
    career: { ...d.career, ...(raw.career ?? {}) },
    strengths: Array.isArray(raw.strengths) && raw.strengths.length
      ? raw.strengths.filter(Boolean).slice(0, 5)
      : d.strengths,
    improvement: Array.isArray(raw.improvement) && raw.improvement.length
      ? raw.improvement.filter(Boolean).slice(0, 3)
      : d.improvement,
    fun: { ...d.fun, ...(raw.fun ?? {}) },
    achievements: Array.isArray(raw.achievements) && raw.achievements.length
      ? raw.achievements.filter(Boolean).slice(0, 12)
      : d.achievements,
    prediction: { ...d.prediction, ...(raw.prediction ?? {}) },
  };
}

export function buildSummary(analysis: Analysis): WrappedSummary {
  return {
    username: analysis.profile.username,
    aiUsed: analysis.profile.aiUsed,
    aiArchetype: analysis.personality.aiArchetype,
    personalityType: analysis.personality.personalityType,
    topStrength: analysis.strengths[0] ?? "Curiosity",
    topInterest: analysis.interests.topTopics[0] ?? "AI",
    bestBadge: analysis.achievements[0] ?? "AI Power User",
    overallScore: analysis.scores.overall,
  };
}

export function pickScoreLabel(analysis: Analysis): string {
  const max = SCORE_KEYS.reduce(
    (best, s) => (analysis.scores[s.key] > analysis.scores[best.key] ? s : best),
    SCORE_KEYS[0]
  );
  return max.label;
}
