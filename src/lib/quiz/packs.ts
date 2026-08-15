export interface PackQuestion {
  text: string;
  options: string[];
}

export interface QuizPack {
  id: string;
  emoji: string;
  title: string;
  description: string;
  questions: PackQuestion[];
}

export const QUIZ_PACKS: QuizPack[] = [
  {
    id: "couple",
    emoji: "💞",
    title: "Couple Quiz",
    description: "For you and your partner — who remembers what?",
    questions: [
      { text: "Who said 'I love you' first?", options: ["Me", "Them", "Neither of us", "We said it together"] },
      { text: "What's our go-to date night?", options: ["Dinner out", "Movie at home", "Walking around", "Gaming together"] },
      { text: "Who's more likely to start a fight over nothing?", options: ["Me", "Them", "Both of us", "We never fight"] },
      { text: "What do I order when we share?", options: ["Something sweet", "Something salty", "The same as you", "The most expensive thing"] },
      { text: "Where do I fall asleep?", options: ["On the sofa", "In your arms", "On my phone", "On the floor"] },
      { text: "Who's better at remembering anniversaries?", options: ["Me", "Them", "Neither — we always forget", "The calendar"] },
    ],
  },
  {
    id: "best-friend",
    emoji: "🤞",
    title: "Best Friend Quiz",
    description: "Do you really know your bestie? Prove it.",
    questions: [
      { text: "What would I do if you cancelled plans last minute?", options: ["Be genuinely fine", "Joke about it for weeks", "Get a little mad", "Plan a payback"] },
      { text: "What's my biggest fear?", options: ["Heights", "Losing people", "Failing", "Spiders"] },
      { text: "Which emoji do I overuse?", options: ["😂", "🥲", "🔥", "😭"] },
      { text: "What am I most likely to spend money on?", options: ["Food", "Clothes", "Gadgets", "Uber rides"] },
      { text: "What's my worst habit?", options: ["Being late", "Overthinking", "Saying 'one more episode'", "Forgetting to reply"] },
      { text: "What would I do with a free weekend?", options: ["Sleep all day", "Hang with you", "Try something new", "Catch up on shows"] },
    ],
  },
  {
    id: "family",
    emoji: "🏠",
    title: "Family Quiz",
    description: "For siblings, parents and cousins who think they know it all.",
    questions: [
      { text: "Who's the loudest at family dinner?", options: ["Me", "You", "Dad", "Mum"] },
      { text: "What would I steal from the fridge at midnight?", options: ["Leftovers", "Ice cream", "Fruit", "Nothing — I'm asleep"] },
      { text: "What chore do I secretly hate?", options: ["Dishes", "Sweeping", "Laundry", "Taking out the trash"] },
      { text: "Who's my favourite relative?", options: ["You", "Grandma", "That one cousin", "The dog"] },
      { text: "What do I do at family gatherings?", options: ["Help in the kitchen", "Disappear with a book", "Entertain everyone", "Hog the TV"] },
      { text: "What am I most likely to argue about at home?", options: ["The remote", "Food", "Money", "Who left the lights on"] },
    ],
  },
  {
    id: "squad",
    emoji: "🎉",
    title: "Squad Quiz",
    description: "For the group chat — who's really carrying the vibes?",
    questions: [
      { text: "Who starts the group chat drama?", options: ["Me", "You", "Someone else", "All of us, honestly"] },
      { text: "What am I like after one drink?", options: ["Dancing on tables", "Deep conversations", "Asking for the aux", "Asking to go home"] },
      { text: "Who's most likely to be late to the hangout?", options: ["Me", "You", "The same person every time", "Nobody — we're early"] },
      { text: "What's my signature group-chat move?", options: ["Sending memes", "Voice notes", "Leaving on read", "Spamming emojis"] },
      { text: "Who plans the actual hangouts?", options: ["Me", "You", "Someone else", "No one plans, we just meet"] },
      { text: "What am I most likely to say when we're lost?", options: ["'I know the way'", "'Let's ask someone'", "'Just walk, it's fine'", "'I'm not the one driving'"] },
    ],
  },
  {
    id: "coworker",
    emoji: "💼",
    title: "Work Buddy Quiz",
    description: "For the desk bestie — do they know your 9-to-5 personality?",
    questions: [
      { text: "What's my coffee order?", options: ["Black", "Latte with syrup", "Whatever's free", "I don't drink coffee"] },
      { text: "What do I do in long meetings?", options: ["Take notes", "Doodle", "Mute and scroll", "Ask lots of questions"] },
      { text: "Who do I sit next to in the office?", options: ["You", "The quiet one", "The funny one", "Nobody — I hide"] },
      { text: "What's my lunch plan?", options: ["Brought from home", "Order out", "Eat at my desk", "Skip it"] },
      { text: "What am I most likely to complain about?", options: ["The internet", "Traffic", "Meetings", "The printer"] },
      { text: "What happens when I get an email on a Friday at 5pm?", options: ["Answer it now", "Leave it for Monday", "Reply 'seen'", "Forward it to you"] },
    ],
  },
];

export function getPack(id: string): QuizPack | undefined {
  return QUIZ_PACKS.find((p) => p.id === id);
}