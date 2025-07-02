import { Question } from "@/shared/types/app";

export interface AssessmentCategory {
  name: string;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
}
export type AssessmentQuestionType = Record<Question['type'],number | string> & {total:number}
export interface AssessmentForm {
  name: string;
  pass_criteria: number;
  technologies: {
    id: string;
    name: string;
    easy: AssessmentQuestionType
    medium: AssessmentQuestionType;
    hard: AssessmentQuestionType;
  }[];
  duration: number | string;
  targetQuestions: number;
}
