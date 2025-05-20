import { CandidateData } from '@/types/candidate.types';
import { StatusOption } from '@/types/common.types';
import { EXAM_STEP, IExam } from '@/types/exam.types';
import { create } from 'zustand';

export type ExamAssessmentOptions = (StatusOption & {
  categories?: { id: string; name: string }[];
})[];

interface ExamStore {
  loading: boolean;
  error: string | null;
  current_step: EXAM_STEP;
  accessCode: string;
  exam: IExam | null;
  candidate: CandidateData | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAccessCode: (code: string) => void;
  setExam: (exam: IExam | null) => void;
  setCurrentStep: (step: EXAM_STEP) => void;
  setCandidate: (candidate: CandidateData | null) => void;
}

export const useExamStore = create<ExamStore>((set) => ({
  loading: false,
  error: null,
  exam: null,
  candidate: null,
  accessCode: '',
  current_step: EXAM_STEP.BASIC_INFO,

  setCandidate: (candidate: CandidateData | null) => {
    set({ candidate });
  },

  setAccessCode: (accessCode: string) => {
    set({ accessCode });
  },

  setCurrentStep: (step: EXAM_STEP) => {
    set({ current_step: step });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setExam: (exam: IExam | null) => {
    set({ exam });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
