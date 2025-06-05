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
  pass_criteria: number;
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
