import { ITimestamps } from './common.types';
import { IAssessment, ICandidate, IQuestion } from './candidate.types';

export interface IExam extends ITimestamps {
  id: string;
  user_id: string;
  assessment_id: string;
  end_time: string;
  start_time: string;
  status?: string;
  is_completed: boolean;
  meta: IExamMeta;
  candidate: ICandidate;
  assessment: IAssessment;
  exam_questions: IExamQuestion[];
}

export interface IExamQuestion extends ITimestamps {
  id: string;
  exam_id: string;
  question_id: string;
  question: IQuestion;
}
export interface IExamMeta {
  examLink: string;
  accessCode: string;
  accessToken: string;
  tokenCreatedAt: string;
  tokenExpiresAt: string;
  [key: string]: unknown;
}

export enum EXAM_STEP {
  BASIC_INFO = 'basicInfo',
  VIDEO_RECORDING = 'videoRecording',
  QUIZ = 'quiz',
}

export enum QuestionType {
  MCQ = 'mcq',
  MULTIPLE_SELECT = 'multiple_select',
  TEXT = 'text',
  CODE_SNIPPET = 'code_snippet',
  VIDEO = 'video',
}

export interface IExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  question: IQuestion;
  created_at: string;
  updated_at: string;
}
