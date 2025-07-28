import { create } from 'zustand';

type QuestionType = 'multiple_select' | 'video' | 'text' | 'mcq' | 'code_snippet' | 'code_editor' | 'code_snippet_with_mcq';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface QuestionPreferencesStore {
  lastSelectedType: QuestionType;
  lastSelectedDifficulty: DifficultyLevel;
  setLastSelectedType: (type: QuestionType) => void;
  setLastSelectedDifficulty: (difficulty: DifficultyLevel) => void;
}

export const useQuestionPreferencesStore = create<QuestionPreferencesStore>((set) => ({
  lastSelectedType: 'mcq',
  lastSelectedDifficulty: 'easy',
  setLastSelectedType: (type) => set({ lastSelectedType: type }),
  setLastSelectedDifficulty: (difficulty) => set({ lastSelectedDifficulty: difficulty }),
})); 