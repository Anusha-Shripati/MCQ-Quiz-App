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
  categories: AssessmentCategory[];
  duration:number | string  | undefined;
  targetQuestions:number
}
