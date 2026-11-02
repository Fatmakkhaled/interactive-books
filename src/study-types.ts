export type StudyMode =
  | "summary"
  | "explain"
  | "flashcards"
  | "quiz"
  | "answer";
export type StudySource = { id: number; text: string };
export type StudySection = {
  heading: string;
  body: string;
  sourceIds: number[];
};
export type Flashcard = {
  question: string;
  answer: string;
  sourceIds: number[];
};
export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  sourceIds: number[];
};
export type StudyContent = {
  title: string;
  overview: string;
  sections: StudySection[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  missingInformation: string[];
};
export type StudyResult = StudyContent & { sources: StudySource[] };
export const studyModes: {
  id: StudyMode;
  title: string;
  description: string;
  symbol: string;
}[] = [
  {
    id: "summary",
    title: "Summarize",
    description: "The big ideas, made clear.",
    symbol: "≡",
  },
  {
    id: "explain",
    title: "Explain",
    description: "Work through tricky concepts.",
    symbol: "✧",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "A little practice, a lot of recall.",
    symbol: "▣",
  },
  {
    id: "quiz",
    title: "Practice quiz",
    description: "Put your understanding to work.",
    symbol: "✓",
  },
  {
    id: "answer",
    title: "Ask a question",
    description: "Find answers in your material.",
    symbol: "?",
  },
];
