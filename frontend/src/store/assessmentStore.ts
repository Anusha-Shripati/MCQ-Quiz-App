import { api } from '@/lib/api';
import { assessmentEndpoint } from '@/lib/endpoint';
import { AssessmentQuestionType } from '@/types/assessment.types';
import { DateRange } from '@/types/common.types';
import { isAxiosError } from 'axios';
import { create } from 'zustand';

export interface Question {
  easy: number;
  medium: number;
  hard: number;
}

export interface Technology {
  id?: string;
  technology: {
    id: string;
    name: string;
  };
  technology_id?: string;
  hard: AssessmentQuestionType;
  easy: AssessmentQuestionType;
  medium: AssessmentQuestionType;
}
export interface Assessment {
  id?: string;
  name: string;
  created_by: string;
  created_at: string;
  pass_criteria: number;
  totalQuestions: number;
  duration: string | number;
  technologies: Technology[];
  created_by_user: {
    id: string;
    name: string;
    deleted_at:string
  };
}
export interface AssessmentFilters {
  name: string;
  created_by: string;
  created_duation: DateRange | undefined;
  view: string;
}
interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  filters: AssessmentFilters;
  isLoading: boolean;
  error: string | null;
  setCurrentAssessment: (assessment: Assessment) => void;
  clearCurrentAssessment: () => void;
  fetchAssessments: () => Promise<void>;
  setFilters: (filters: AssessmentFilters) => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  assessments: [],
  filters: {
    name: '',
    created_by: 'all',
    created_duation: undefined,
    view: '',
  },
  currentAssessment: null,
  isLoading: false,
  error: null,
  fetchAssessments: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(assessmentEndpoint.LIST);
      set({ assessments: response.data.data, isLoading: false, error: null });
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch assessments';
        set({ error: errorMessage, isLoading: false });
        throw new Error(errorMessage);
      }
      set({ error: 'Failed to fetch assessments', isLoading: false });
    }
  },
  setFilters: (filters: AssessmentFilters) => {
    set({ filters });
  },
  setCurrentAssessment(assessment: Assessment) {
    set({ currentAssessment: assessment });
  },
  clearCurrentAssessment() {
    set({ currentAssessment: null });
  },
}));
