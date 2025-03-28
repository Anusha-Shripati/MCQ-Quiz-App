import { DateRange } from "./common.types";

export interface CandidateDetails {
  totalPercentage: string;
  categories: Record<string, string>;
  createdBy: string;
  createdOn: string;
}

export interface Candidate {
  id: number;
  testDate: string;
  testStartTime: string;
  testEndTime: string;
  name: string;
  email: string;
  technology: string;
  experience: string;
  assessment: string;
  result: string;
  created: string;
  details?: CandidateDetails;
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