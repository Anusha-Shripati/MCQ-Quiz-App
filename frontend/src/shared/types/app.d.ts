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
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}