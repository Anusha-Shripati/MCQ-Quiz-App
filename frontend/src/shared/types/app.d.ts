type Exam = {
  date: string;
  task: string;
  candidate: string;
};

interface QuestionCategory {
  name: string;
  easy: number;
  medium: number;
  hard: number;
}

export interface Question {
  id: number;
  type: "multiple-choice" | "radio-select" | "fill-in-the-blanks" | "code-snippet";
  question: string;
  options?: string[];
  correctOptions?: (string | number)[];
  correctAnswer?: string; 
  difficulty: "easy" | "medium" | "hard";
  answer?: string;
  code?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}