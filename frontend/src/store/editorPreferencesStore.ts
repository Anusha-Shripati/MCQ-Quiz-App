import { create } from 'zustand';

interface EditorPreferencesStore {
  preferences: Record<string, {
    language: string;
    theme: string;
  }>;
  setPreference: (questionId: string, language: string, theme: string) => void;
  getPreference: (questionId: string) => {
    language: string;
    theme: string;
  };
}

export const useEditorPreferencesStore = create<EditorPreferencesStore>((set, get) => ({
  preferences: {},
  setPreference: (questionId, language, theme) => 
    set((state) => ({
      preferences: {
        ...state.preferences,
        [questionId]: { language, theme }
      }
    })),
  getPreference: (questionId) => {
    const state = get();
    return (
      state.preferences[questionId] || {
        language: 'javascript',
        theme: 'vs-dark'
      }
    );
  }
})); 