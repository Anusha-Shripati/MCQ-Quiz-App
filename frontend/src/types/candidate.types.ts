import { DateRange, ITimestamps } from './common.types';
import { IExam, Result } from './exam.types';

export type CandidateFormData = {
  id?: string;
  name: string;
  email: string;
  technology: string;
  experience: string;
  assessment: string;
  phone: string;
  timeUnit: 'days' | 'hours';
  startDate: Date | undefined;
  endDate: Date | undefined;
  timeValue: number | '';
};

export interface CandidateData {
  id?: string;
  name: string;
  email: string;
  experience: string;
  exam_id: string;
  assessment: {
    id: string;
    name: string;
    technologies: {
      id: string;
      technology: {
        id: string;
        name: string;
      };
    }[];
  };
  technology: {
    id: string;
    name: string;
  };
  phone: string;
  timeUnit: 'days' | 'hours';
  startDate: Date | undefined;
  endDate: Date | undefined;
  timeValue: number | '';
}

export interface CandidateDetails {
  totalPercentage: string;
  categories: Record<string, string>;
  createdBy: string;
  createdOn: string;
}

export interface ITechnology {
  id: string;
  name: string;
}

export interface IAssessmentTechnology {
  technology_id: string;
  assessment_id: string;
  easy: number;
  medium: number;
  hard: number;
  technology: ITechnology;
}

export interface IAssessment extends ITimestamps {
  id: string;
  name: string;
  created_by: string;
  easy: number;
  medium: number;
  hard: number;
  difficulty_score: number;
  duration: number;
  technologies?: IAssessmentTechnology[];
  pass_criteria: number;
}

export interface IQuestion extends ITimestamps {
  id: string;
  technology_id: string;
  question: string;
  options: string[];
  time: string;
  difficulty_level: string;
  type: string;
  meta?: Record<string, unknown>;
}

export interface ICandidateMeta {
  examLink: string;
  accessCode: string;
  accessToken: string;
  tokenCreatedAt: string;
  tokenExpiresAt: string;
  [key: string]: unknown;
}

export interface ICandidate extends ITimestamps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: Result[];
  id?: string;
  assessment_id: string;
  exam_id: string;
  name: string;
  email: string;
  experience: string;
  phone: string;
  meta: ICandidateMeta | Record<string, unknown>;
  assessment?: IAssessment;
  exam?: IExam;
  results: string[];
  technology?: {
    name: string;
  };
  created_by_user?:{
    name:string;
    deleted_at:string

  }
}

export interface FiltersProps {
  candidates?: ICandidate[];
}

export interface TechnologyOption {
  value: string;
  label: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface AssessmentOption {
  value: string;
  label: string;
}

export interface CandidateFilter {
  searchQuery: string;
  technologyFilter: TechnologyOption[];
  assessmentFilter: AssessmentOption[];
  created?: {
    range: DateRange | undefined;
    days: string;
  };
  experience?: {
    min: number | null;
    max: number | null;
    range: string;
  };
}

export interface CandidateResult {
  id: string;
  candidate_id: string;
  assessment_id: string;
  score: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
