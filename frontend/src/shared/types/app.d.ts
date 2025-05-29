type Exam = {
  date: string;
  task: string;
  candidate: string;
};

// interface QuestionCategory {
//   name: string;
//   easy: number;
//   medium: number;
//   hard: number;
// }
export type QuestionCategory = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  difficultyCount: {
    easy: number;
    medium: number;
    hard: number;
  };
};

// export interface Question {
//   id: number;
//   type: "multiple-choice" | "radio-select" | "fill-in-the-blanks" | "code-snippet";
//   question: string;
//   options?: string[];
//   correctOptions?: (string | number)[];
//   correctAnswer?: string;
//   difficulty: "easy" | "medium" | "hard";
//   answer?: string;
//   code?: string;
// }

export interface Question {
  id?: string;
  technology_id: string;
  question: string;
  correct_answer: string[]; // use string from API
  options: string[];
  time: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  type: 'multiple_select' | 'video' | 'text' | 'mcq' | 'code_snippet' | 'code_editor';
  meta?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

export interface TablePaginationProps {
  currentPageStart: number;
  currentPageEnd: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (e: number) => void;
  onPerPageChange: (e: string) => void;
  className?: string;
  loading?: boolean;
}
