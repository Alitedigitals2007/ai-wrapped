import type { Analysis } from "./types";
import { mergeAnalysis } from "./types";

const STOPWORDS = new Set(
  "the,a,an,and,or,but,if,then,else,for,of,to,in,on,at,by,with,from,as,is,are,was,were,be,been,being,it,its,this,that,these,those,i,me,my,mine,you,your,yours,he,she,we,us,they,them,their,not,no,so,do,does,did,have,has,had,will,would,can,could,should,may,might,must,about,into,over,under,again,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,only,own,same,than,too,very,just,also,who,what,which,up,out,off,down,during,before,after,above,below,between,through,during,per,like,get,got,one,two,im,ive,id,youre,dont,its,want,need,lot,lets,using,use,used,really,actually,something,anything,nothing,everything,make,made,makes,work,working,know,think,good,great,always,never,often,sometimes,probably,maybe,things,thing,way,ways,time,times,people"
    .split(",")
);

const TOPIC_KEYWORDS: Record<string, string[]> = {
  AI: ["ai", "artificial intelligence", "machine learning", "deep learning", "llm", "gpt", "chatgpt", "gemini", "claude", "cerebras", "neural", "model", "prompt", "agent"],
  Programming: ["code", "coding", "programming", "developer", "software", "api", "function", "bug", "debug", "typescript", "python", "javascript", "react", "app", "database", "frontend", "backend", "github"],
  Science: ["science", "physics", "chemistry", "biology", "quantum", "experiment", "research paper", "lab", "astronomy", "space"],
  Mathematics: ["math", "mathematics", "calculus", "algebra", "statistics", "probability", "equation", "algorithm"],
  Business: ["business", "startup", "entrepreneur", "startup", "company", "marketing", "sales", "revenue", "customer", "strategy", "product market"],
  Finance: ["finance", "invest", "investing", "stock", "crypto", "money", "trading", "budget", "portfolio"],
  Design: ["design", "ui", "ux", "figma", "logo", "brand", "color", "typography", "wireframe", "creative direction"],
  Writing: ["write", "writing", "essay", "article", "blog", "story", "novel", "script", "copy", "content", "edit"],
  Health: ["health", "fitness", "workout", "diet", "nutrition", "meditation", "sleep", "mental health"],
  History: ["history", "historical", "ancient", "war", "empire", "archaeology", "civilization"],
  Psychology: ["psychology", "mind", "behavior", "brain", "cognitive", "personality", "emotion"],
  Education: ["learn", "learning", "study", "student", "course", "tutorial", "school", "university", "exam", "homework"],
  Career: ["career", "job", "interview", "resume", "salary", "promotion", "workplace"],
  Gaming: ["game", "gaming", "video game", "esports", "minecraft", "gamedev"],
  Music: ["music", "song", "guitar", "piano", "beat", "produce", "lyrics"],
};

const CAREER_BY_TOPIC: Record<string, [string, string, string]> = {
  AI: ["AI Engineer", "Machine Learning Scientist", "AI Product Manager"],
  Programming: ["Software Engineer", "Full-Stack Developer", "Solutions Architect"],
  Science: ["Research Scientist", "Physicist", "Science Communicator"],
  Mathematics: ["Data Scientist", "Quantitative Analyst", "Mathematician"],
  Business: ["Startup Founder", "Business Strategist", "Product Manager"],
  Finance: ["Financial Analyst", "Investment Banker", "FinTech Product Lead"],
  Design: ["Product Designer", "UX Designer", "Creative Director"],
  Writing: ["Technical Writer", "Content Strategist", "Author"],
  Health: ["Health Coach", "Wellness Consultant", "Biotech Researcher"],
  History: ["Historian", "Museum Curator", "Policy Analyst"],
  Psychology: ["Psychologist", "UX Researcher", "People Ops Lead"],
  Education: ["Educator", "Instructional Designer", "EdTech Product Lead"],
  Career: ["HR Consultant", "Career Coach", "People Manager"],
  Gaming: ["Game Designer", "Game Developer", "Esports Analyst"],
  Music: ["Music Producer", "Sound Designer", "Composer"],
};

const PERSONALITY_TYPES = [
  { type: "Strategic Thinker", score: "criticalThinking" as const },
  { type: "Creative Visionary", score: "creativity" as const },
  { type: "Innovation Driver", score: "innovation" as const },
  { type: "Persuasive Communicator", score: "communication" as const },
  { type: "Masterful Learner", score: "learning" as const },
  { type: "Relentless Builder", score: "productivity" as const },
  { type: "Natural Leader", score: "leadership" as const },
  { type: "Problem Solver Extraordinaire", score: "problemSolving" as const },
];

const ARCHETYPES = [
  "The Philosopher",
  "The Builder",
  "The Scientist",
  "The Artist",
  "The Explorer",
  "The Advisor",
  "The Innovator",
];

const ACHIEVEMENTS: Record<string, { badge: string; threshold: number }> = {
  researcher: { badge: "Researcher", threshold: 55 },
  builder: { badge: "Builder", threshold: 55 },
  innovator: { badge: "Innovator", threshold: 65 },
  creator: { badge: "Creator", threshold: 65 },
  explorer: { badge: "Explorer", threshold: 55 },
  scholar: { badge: "Scholar", threshold: 60 },
  problemSolver: { badge: "Problem Solver", threshold: 60 },
  powerUser: { badge: "AI Power User", threshold: 60 },
  fastLearner: { badge: "Fast Learner", threshold: 65 },
  nightOwl: { badge: "Night Owl", threshold: 50 },
  knowledgeSeeker: { badge: "Knowledge Seeker", threshold: 55 },
};

const LEVELS = (n: number): string =>
  n >= 80 ? "Very High" : n >= 65 ? "High" : n >= 45 ? "Moderate" : "Low";

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) ?? [];
}

function sentences(text: string): string[] {
  return text.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 0);
}

function topWords(text: string, count: number): string[] {
  const freq = new Map<string, number>();
  for (const w of words(text)) {
    if (w.length < 3 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([w]) => w);
}

function topPhrases(text: string, count: number): string[] {
  const ws = words(text);
  const freq = new Map<string, number>();
  for (let i = 0; i < ws.length - 1; i++) {
    const pair = `${ws[i]} ${ws[i + 1]}`;
    if (STOPWORDS.has(ws[i]) && STOPWORDS.has(ws[i + 1])) continue;
    freq.set(pair, (freq.get(pair) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(([p]) => p);
}

function topicScores(text: string): { topic: string; score: number }[] {
  const lower = ` ${text.toLowerCase()} `;
  return Object.entries(TOPIC_KEYWORDS)
    .map(([topic, kws]) => {
      let score = 0;
      for (const kw of kws) {
        const re = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "g");
        const m = lower.match(re);
        if (m) score += Math.min(m.length, 8);
      }
      return { topic, score };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function analyzeLocally(input: {
  username: string;
  aiUsed: string;
  text: string;
}): Analysis {
  const text = input.text.trim();
  const wordList = words(text);
  const sentList = sentences(text);
  const totalWords = wordList.length;
  const totalChars = text.length;

  const creativity = Math.min(
    98,
    Math.max(40, Math.round(45 + (totalWords / 400) * 20 + (text.match(/imagine|idea|creative|story|design|dream|what if|invent/i)?.length ?? 0) * 4))
  );
  const criticalThinking = Math.min(
    98,
    Math.max(38, Math.round(40 + (totalWords / 500) * 15 + (text.match(/why|because|therefore|however|analysis|compare|evaluate/i)?.length ?? 0) * 3))
  );
  const problemSolving = Math.min(
    98,
    Math.max(38, Math.round(40 + (totalWords / 500) * 15 + (text.match(/solve|solution|fix|debug|troubleshoot|optimize|strategy/i)?.length ?? 0) * 3))
  );
  const learning = Math.min(
    98,
    Math.max(38, Math.round(40 + (totalWords / 500) * 18 + (text.match(/learn|study|curious|new skill|course|understand/i)?.length ?? 0) * 3))
  );
  const communication = Math.min(
    98,
    Math.max(38, Math.round(40 + (sentList.length / 25) * 20 + (text.match(/explain|present|write|communicate|clear/i)?.length ?? 0) * 3))
  );
  const leadership = Math.min(
    98,
    Math.max(30, Math.round(32 + (text.match(/lead|team|mentor|guide|manage|vision|influence/i)?.length ?? 0) * 6))
  );
  const innovation = Math.min(
    98,
    Math.max(35, Math.round(38 + creativity * 0.3 + (text.match(/new|startup|invent|disrupt|build|create/i)?.length ?? 0) * 3))
  );
  const productivity = Math.min(
    98,
    Math.max(30, Math.round(35 + (text.match(/efficient|automate|save time|productivity|workflow|organize|plan/i)?.length ?? 0) * 6))
  );

  const scoreMap: Record<keyof Analysis["scores"], number> = {
    creativity,
    leadership,
    communication,
    learning,
    productivity,
    problemSolving,
    criticalThinking,
    innovation,
    overall: 0,
  };

  const topics = topicScores(text);
  const topTopics = (topics.length ? topics : [{ topic: "AI", score: 1 }, { topic: "Technology", score: 1 }])
    .slice(0, 5)
    .map((t) => t.topic);

  const dominantTopic = topTopics[0];

  const avgWordLength =
    totalWords > 0 ? totalChars / totalWords : 5;
  const avgSentenceLength =
    sentList.length > 0 ? Math.round(totalWords / sentList.length) : 12;

  const vocabularyLevel =
    avgWordLength > 5.4 || avgSentenceLength > 22
      ? "Advanced"
      : avgWordLength > 4.8
        ? "Rich"
        : avgWordLength > 4.3
          ? "Moderate"
          : "Basic";

  const averageComplexity =
    avgSentenceLength > 22 ? "Complex" : avgSentenceLength > 14 ? "Moderate" : "Simple";

  const writingStyle =
    text.match(/\b(build|code|api|implement|function|deploy)\b/i)
      ? "Technical"
      : text.match(/\b(story|narrative|describe|imagine)\b/i)
        ? "Storytelling"
        : text.match(/\b(clear|concise|summary|bullet)\b/i)
          ? "Concise & Clear"
          : "Balanced";

  const promptStyle =
    text.match(/\b(step by step|explain like|for a beginner)\b/i)
      ? "Beginner-Friendly Requests"
      : text.match(/\b(draft|rewrite|improve|polish)\b/i)
        ? "Iterative Refinement"
      : text.match(/\b(compare|difference between|versus)\b/i)
          ? "Explorative Comparison"
          : "Direct & Practical";

  const questionStyle =
    text.match(/\b(what if|how would|imagine if)\b/i)
      ? "Hypothetical"
      : text.match(/\b(why|how|what)\b/i)
        ? "Open-Ended"
        : "Balanced";

  const mostUsedWord = topWords(text, 1)[0] ?? "think";
  const phrase = topPhrases(text, 1)[0];
  const mostUsedPhrase = phrase && phrase.length > 3 ? phrase : "What if";

  const hours =
    text.match(/\b(\d+)\s*hours?\b/i)?.[1] ??
    text.match(/\b(\d+)\s*(hrs|hr)\b/i)?.[1];
  const estimatedHoursSaved = hours
    ? `${hours} hours/week`
    : `${Math.max(2, Math.round(creativity / 15))} hours/week`;

  const strengths: string[] = [];
  const strengthMap: [string, number, number][] = [
    ["Creativity", creativity, 60],
    ["Critical Thinking", criticalThinking, 60],
    ["Problem Solving", problemSolving, 60],
    ["Fast Learning", learning, 60],
    ["Clear Communication", communication, 55],
    ["Innovation Mindset", innovation, 60],
    ["Leadership Potential", leadership, 55],
    ["Productivity", productivity, 55],
  ];
  strengthMap.sort((a, b) => b[1] - a[1]);
  for (const [name, score, threshold] of strengthMap) {
    if (strengths.length >= 5) break;
    if (score >= threshold) strengths.push(name);
  }
  while (strengths.length < 5) strengths.push(["Curiosity", "Adaptability", "Consistency", "Ambition", "Open-Mindedness"][strengths.length]);

  const weakest = [...strengthMap].sort((a, b) => a[1] - b[1]).slice(0, 3);
  const improvement = weakest.map((_, i) =>
    ["Structured Planning", "Consistency", "Focus & Prioritization", "Public Speaking", "Time Management", "Long-Form Writing"][i]
  );

  const sortedPersonality = [...PERSONALITY_TYPES].sort(
    (a, b) => scoreMap[b.score] - scoreMap[a.score]
  );
  const personalityType = sortedPersonality[0].type;
  const aiArchetype = ARCHETYPES[Math.round(creativity / 20) % ARCHETYPES.length];

  const achievements: string[] = [];
  const achievementChecks: [keyof typeof ACHIEVEMENTS, number][] = [
    ["researcher", learning + criticalThinking],
    ["builder", problemSolving + productivity],
    ["innovator", innovation],
    ["creator", creativity],
    ["explorer", learning],
    ["scholar", learning + criticalThinking],
    ["problemSolver", problemSolving],
    ["powerUser", creativity + learning],
    ["fastLearner", learning],
    ["knowledgeSeeker", learning + curiosity()],
    ["nightOwl", 45],
  ];
  function curiosity(): number {
    return Math.min(98, 55 + Math.round((text.match(/\?/g)?.length ?? 0) * 0.8 + learning * 0.2));
  }
  for (const [key, score] of achievementChecks) {
    const a = ACHIEVEMENTS[key];
    if (score >= a.threshold) achievements.push(a.badge);
    if (achievements.length >= 6) break;
  }
  if (achievements.length === 0) achievements.push("Curious Mind");

  const career = CAREER_BY_TOPIC[dominantTopic] ?? CAREER_BY_TOPIC.AI;

  const funFactBase = dominantTopic || "curiosity";
  const creative = creativity >= 65;
  const isQuestionHeavy = (text.match(/\?/g)?.length ?? 0) > 4;

  const fun = {
    signaturePrompt:
      text.match(/explain like i'm five|eli5|step by step/i)
        ? "Explain like I'm five"
        : promptStyle.includes("Detailed")
          ? "Long, detailed briefs with context"
          : "Direct, to-the-point requests",
    mostUnexpectedPrompt:
      text.match(/\b(music|song|poem|joke|draw|paint)\b/i)
        ? "Generating creative content like songs and poems"
        : "Combining totally unrelated topics in one prompt",
    biggestRabbitHole: funFactBase,
    wildestQuestion: isQuestionHeavy
      ? `Hypothetical "what if" questions about ${funFactBase}`
      : `Deep questions that connect ${funFactBase} to everyday life`,
    mostCreativeMoment: creative
      ? "Turning a random thought into a full creative brief"
      : "Finding elegant solutions to messy problems",
    funniestInsight: `Asks surprisingly sharp questions about ${funFactBase}`,
  };

  const topThree = topTopics.slice(0, 3);

  return mergeAnalysis({
    profile: {
      username: input.username,
      aiUsed: input.aiUsed,
      generatedDate: new Date().toISOString(),
    },
    personality: {
      personalityType,
      aiArchetype,
      communicationStyle:
        communication >= 75 ? "Persuasive" : communication >= 55 ? "Thoughtful" : "Reserved",
      thinkingStyle:
        criticalThinking >= 70
          ? "First-Principles"
          : creativity >= 70
            ? "Big-Picture"
            : "Analytical",
      learningStyle: "Project-Based",
      decisionStyle: criticalThinking >= 60 ? "Data-Driven" : "Balanced",
      leadershipStyle: leadership >= 55 ? "Collaborative" : "Coaching",
      confidenceLevel: LEVELS(Math.round((creativity + leadership) / 2)),
      curiosityLevel: LEVELS(curiosity()),
      creativityLevel: LEVELS(creativity),
    },
    scores: scoreMap,
    language: {
      mostUsedWord,
      mostUsedPhrase,
      vocabularyLevel,
      writingStyle,
      promptStyle,
      questionStyle,
      averageComplexity,
    },
    interests: {
      topTopics,
      topSubjects: topThree.length ? [...topThree, ...topTopics].slice(0, 5) : ["Artificial Intelligence"],
      favoriteDomain: dominantTopic,
      mostDiscussedArea: dominantTopic,
    },
    productivity: {
      estimatedHoursSaved,
      mostCommonUse: productivity >= 65 ? "Building and shipping things" : "Learning new things",
      researchLevel: learning >= 60 ? "High" : learning >= 40 ? "Medium" : "Low",
      writingLevel: communication >= 60 ? "High" : communication >= 40 ? "Medium" : "Low",
      codingLevel: problemSolving >= 60 ? "High" : problemSolving >= 40 ? "Medium" : "Low",
    },
    career: {
      topMatch: career[0],
      secondMatch: career[1],
      thirdMatch: career[2],
    },
    strengths,
    improvement,
    fun,
    achievements,
    prediction: {
      nextSkill: criticalThinking >= 65 ? "Advanced prompt engineering" : "Structured problem solving",
      nextChallenge: `Taking on a bigger ${funFactBase} project end-to-end`,
      bookRecommendation:
        criticalThinking >= 65 ? "The Alignment Problem" : "Atomic Habits",
      projectRecommendation: `A personal project that applies ${topThree[0] ?? "AI"} to something you use daily`,
      learningRecommendation: `A structured course combining ${topThree.slice(0, 2).join(" and ") || "AI and design"}`,
    },
  });
}
