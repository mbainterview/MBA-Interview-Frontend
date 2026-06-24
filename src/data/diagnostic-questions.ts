export interface DiagnosticQuestion {
  id: number;
  prompt: string;
}

/**
 * 10 baseline diagnostic interview questions used by /onboarding/diagnostic.
 * Sourced from the Figma frames 812:8095 / 8126 / 8157.
 */
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  { id: 1, prompt: "What has been the most significant experience in your career." },
  { id: 2, prompt: "What is one weakness you are currently working on?" },
  { id: 3, prompt: "Why do you want to pursue an MBA at this point in your career?" },
  { id: 4, prompt: "Describe a leadership moment you are most proud of." },
  { id: 5, prompt: "Tell me about a time you received difficult feedback. How did you respond?" },
  { id: 6, prompt: "Walk me through your post-MBA short-term and long-term goals." },
  { id: 7, prompt: "How do you approach making decisions with incomplete information?" },
  { id: 8, prompt: "Describe a time you had a disagreement with a teammate. How did you resolve it?" },
  { id: 9, prompt: "What unique perspective will you bring to your MBA cohort?" },
  { id: 10, prompt: "Tell me about a time you solved a difficult problem." },
];
