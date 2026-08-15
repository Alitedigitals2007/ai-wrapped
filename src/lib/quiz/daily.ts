export interface DailyOption {
  key: string;
  emoji: string;
  label: string;
  result: string;
}

export interface DailyQuestion {
  id: string;
  emoji: string;
  text: string;
  options: DailyOption[];
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  {
    id: "dq1",
    emoji: "☀️",
    text: "You wake up and there's no plan for the day. What do you do?",
    options: [
      { key: "A", emoji: "🚀", label: "Make one immediately", result: "A natural leader. You're driven, and honestly, a little type-A — and the world needs that." },
      { key: "B", emoji: "🛋️", label: "Enjoy the nothing", result: "A connoisseur of calm. You recharge on rest and know exactly what you're worth." },
      { key: "C", emoji: "📱", label: "Ask a friend what they're doing", result: "A people person. Your energy lives in connection — your friends are your fuel." },
      { key: "D", emoji: "🌀", label: "Let the day decide", result: "A free spirit. You flow, you adapt, and you secretly have the best stories." },
    ],
  },
  {
    id: "dq2",
    emoji: "🍕",
    text: "Your friends want to share one meal. What do you order?",
    options: [
      { key: "A", emoji: "🍕", label: "Pizza — everyone agrees", result: "The diplomat. You pick peace over drama, and that's why everyone loves you." },
      { key: "B", emoji: "🌮", label: "Something new and spicy", result: "The adventurer. You live for novelty — mildly chaotic, highly memorable." },
      { key: "C", emoji: "🍜", label: "Whatever's fastest", result: "The pragmatist. You optimise for outcome, not opinions. Efficient legend." },
      { key: "D", emoji: "🍰", label: "Straight to dessert", result: "The hedonist. You know the main course is a distraction. Priorities unlocked." },
    ],
  },
  {
    id: "dq3",
    emoji: "📱",
    text: "You just got left on read for hours. First thought?",
    options: [
      { key: "A", emoji: "😌", label: "They're busy, I'll text later", result: "Secure attachment, unlocked. You don't spiral — that's emotional gold." },
      { key: "B", emoji: "💭", label: "Did I say something wrong?", result: "A deep overthinker. You replay the tape — but it usually means you care a lot." },
      { key: "C", emoji: "📵", label: "I'm matching that energy", result: "A strategist. You guard your attention like a resource — boundary king/queen." },
      { key: "D", emoji: "📞", label: "Call them instead", result: "A mover. You skip the games and go straight to the source. Respect." },
    ],
  },
  {
    id: "dq4",
    emoji: "🎯",
    text: "A friend asks for your honest opinion on their big idea. It's... bad.",
    options: [
      { key: "A", emoji: "🫣", label: "Find something nice to say", result: "The softie. You protect feelings first — kind, but the truth might need a nudge." },
      { key: "B", emoji: "🗣️", label: "Tell them straight", result: "The truth-teller. You value honesty over comfort — a rare and precious trait." },
      { key: "C", emoji: "🤝", label: "Say it but gently", result: "The diplomat. You deliver hard truths in velvet — the perfect balance." },
      { key: "D", emoji: "📊", label: "Ask them how they'd improve it", result: "The coach. You don't judge — you develop. Friends keep you close for this." },
    ],
  },
  {
    id: "dq5",
    emoji: "🌧️",
    text: "Your plan gets rained out at the last second. You:",
    options: [
      { key: "A", emoji: "🎲", label: "Pivot to a new plan", result: "The improviser. Nothing phases you — you turn setbacks into setups." },
      { key: "B", emoji: "🛏️", label: "Take it as a sign to rest", result: "The optimist. You find the silver lining even in weather. Peak resilience." },
      { key: "C", emoji: "😤", label: "Mildly annoyed, still going", result: "The grinder. Rain won't stop you. You've never let weather own you." },
      { key: "D", emoji: "🍿", label: "Turn it into a movie night", result: "The cozier. You see every disaster as a content opportunity. Iconic." },
    ],
  },
  {
    id: "dq6",
    emoji: "💬",
    text: "What makes you feel most understood?",
    options: [
      { key: "A", emoji: "🫶", label: "Someone who just listens", result: "You crave depth, not noise. Your heart runs on being truly heard." },
      { key: "B", emoji: "🤣", label: "Someone who gets my jokes", result: "Humor is your love language. If they laugh, you've already won." },
      { key: "C", emoji: "⚡", label: "Someone who finishes my sentences", result: "You're wired for sync. A person who just *gets* you is your whole world." },
      { key: "D", emoji: "🛡️", label: "Someone who has my back no matter what", result: "Loyalty is sacred to you. Once they're in, they're in for life." },
    ],
  },
  {
    id: "dq7",
    emoji: "🎁",
    text: "It's your birthday. Perfect day looks like:",
    options: [
      { key: "A", emoji: "🎉", label: "Everyone I love in one room", result: "The gatherer. You measure wealth in people, not things. Heart of gold." },
      { key: "B", emoji: "✈️", label: "Somewhere I've never been", result: "The explorer. Your version of celebration is a passport stamp. Wander on." },
      { key: "C", emoji: "🛋️", label: "Peace and quiet", result: "The introverted icon. You treat yourself like royalty — alone time is the gift." },
      { key: "D", emoji: "🏆", label: "Achieving something big", result: "The achiever. You feel most alive when you level up. Chase that win." },
    ],
  },
  {
    id: "dq8",
    emoji: "📝",
    text: "Someone posts a hot take you disagree with. You:",
    options: [
      { key: "A", emoji: "⌨️", label: "Debate them in the comments", result: "The debater. You love a good mental sparring match — courage in text form." },
      { key: "B", emoji: "🤐", label: "Scroll past, keep the peace", result: "The pacifist. You pick your battles wisely — and honestly, that's power." },
      { key: "C", emoji: "💬", label: "Talk about it with friends privately", result: "The connector. You process through people you trust, not public drama." },
      { key: "D", emoji: "🔍", label: "Research it before deciding", result: "The thinker. You form opinions with receipts. Intellectual honesty, unlocked." },
    ],
  },
];

export const DAY_MS = 24 * 60 * 60 * 1000;

export function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function getDailyQuestion(date: Date): DailyQuestion {
  const n = dayNumber(date);
  return DAILY_QUESTIONS[n % DAILY_QUESTIONS.length];
}

export function nextDailyReset(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}