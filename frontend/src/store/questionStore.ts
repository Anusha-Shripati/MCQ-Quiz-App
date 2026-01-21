import { create } from 'zustand';

interface Questions {
  technology_id: string;
  question: string;
  correct_answer: string;
  options: [string, string, string, string, string, string];
  time: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  type:
    | 'multiple_select'
    | 'video'
    | 'text'
    | 'mcq'
    | 'code_snippet'
    | 'code_snippet_with_mcq'
    | 'code_editor';
  meta: Record<string, unknown>;
}

interface QuestionStore {
  questionFilter: {
    search: string;
    difficulty: Questions['difficulty_level'][];
    type: Questions['type'][];
  };
  technologyFilter: string;
  questionCount: number;
  questionList: Questions[];
  setQuestionFilter: (
    search: string,
    difficulty: Questions['difficulty_level'][],
    type: Questions['type'][]
  ) => void;
  setTechnologyFilter: (filter: string) => void;
  setQuestionListData: (count: number, list: Questions[]) => void;
}

export const useQuestionStore = create<QuestionStore>((set) => ({
  questionFilter: {
    search: '',
    difficulty: ['easy', 'medium', 'hard'],
    type: ['multiple_select', 'video', 'text', 'mcq', 'code_snippet', 'code_snippet_with_mcq'],
  },
  technologyFilter: '',
  questionCount: 0,
  questionList: [],
  setQuestionFilter: (
    search: string,
    difficulty: Questions['difficulty_level'][],
    type: Questions['type'][]
  ) => {
    set({ questionFilter: { search, difficulty, type } });
  },
  setTechnologyFilter: (filter: string) => {
    set({ technologyFilter: filter });
  },
  setQuestionListData: (count: number, list: Questions[]) => {
    set({ questionList: list, questionCount: count });
  },
}));
