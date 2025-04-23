export interface AssessmentCategory {
  name: string;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
}
export interface AssessmentForm {
  name: string;
  technologies: {
    id: string;
    name: string;
    easy: number;
    medium: number;
    hard: number;
  }[];
  duration: number | string;
  targetQuestions: number;
}
