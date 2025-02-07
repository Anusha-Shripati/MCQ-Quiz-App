export interface CandidateDetails {
  totalPercentage: string;
  mongodb: string;
  expressJs: string;
  reactJs: string;
  nodeJs: string;
  createdBy: string;
  createdOn: string;
}

export interface Candidate {
  id: number;
  date: string;
  name: string;
  email: string;
  technology: string;
  experience: string;
  assessment: string;
  result: string;
  created: string;
  details: CandidateDetails;
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