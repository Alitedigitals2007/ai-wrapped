import { create } from "zustand";

interface WizardState {
  step: number;
  username: string;
  aiUsed: string;
  response: string;
  generating: boolean;
  setStep: (step: number) => void;
  setUsername: (username: string) => void;
  setAiUsed: (ai: string) => void;
  setResponse: (response: string) => void;
  setGenerating: (generating: boolean) => void;
  reset: () => void;
}

export const useWizard = create<WizardState>((set) => ({
  step: 0,
  username: "",
  aiUsed: "",
  response: "",
  generating: false,
  setStep: (step) => set({ step }),
  setUsername: (username) => set({ username }),
  setAiUsed: (aiUsed) => set({ aiUsed }),
  setResponse: (response) => set({ response }),
  setGenerating: (generating) => set({ generating }),
  reset: () =>
    set({ step: 0, username: "", aiUsed: "", response: "", generating: false }),
}));
