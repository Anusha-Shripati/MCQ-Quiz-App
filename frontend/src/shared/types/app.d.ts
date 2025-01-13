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
