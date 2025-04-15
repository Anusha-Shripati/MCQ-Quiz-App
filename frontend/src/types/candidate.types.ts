import { DateRange } from "./common.types";


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

export interface CandidateDetails {
  totalPercentage: string;
  categories: Record<string, string>;
  createdBy: string;
  createdOn: string;
}

export interface Candidate {
  id?: string;
  assessment_id: string;
  technology_id: string;
  exam_id: string;
  name: string;
  email: string;
  experience: string;
  phone: string;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  assessment?: {
    id: string;
    name: string;
    created_by: string;
    easy: number;
    medium: number;
    hard: number;
    difficulty_score: number;
    duration: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    technologies?:{
      name:string,
      id:string
    }[]
  };
  technology?: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  exam?: {
    id: string;
    user_id: string;
    assessment_id: string;
    end_time: string;
    start_time: string;
    is_completed: boolean;
    meta: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  candidate_assessments: CandidateAssessment[];
  results: string[];
}

export interface FiltersProps {
  candidates?: Candidate[];
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
    days:string
  };
  experience?:{
    min:number |null,
    max:number|null,
    range:string
  }

}

export interface CandidateAssessment {
  id: string;
  candidate_id: string;
  assessment_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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