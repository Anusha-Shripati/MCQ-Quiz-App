import { StatusOption } from '@/types/common.types';
import { Result, ResultFilter } from '@/types/exam.types';
import { create } from 'zustand';

export type AssessmentOptions = (StatusOption & {
  technologies?: { id: string; name: string }[];
})[];

interface ResultStore {
  resultFilter:ResultFilter
  resultCount: number;
  resultList: Result[];
  setResultFilter: (filter: ResultFilter) => void;
  setResultListData: (count: number, list: Result[]) => void;
  assessmentOptions: AssessmentOptions;
  technologyOptions: StatusOption[];
  setAssessmentOptions: (options: AssessmentOptions) => void;
  setTechnologyOptions: (options: StatusOption[]) => void;
}
const candidateAssessmentOptions: AssessmentOptions = [];

export const useResultStore = create<ResultStore>((set) => ({
  resultFilter: {
    search: '',
    assessmentFilter: [],
    technologyFilter: [],
    startDate: undefined,
    endDate: undefined,
    percentageFrom: null,
    percentageTo: null,
   experienceFrom: null,
   experienceTo: null,
    days:""
  },
  resultCount: 0,
  resultList: [],
  assessmentOptions: candidateAssessmentOptions,
  technologyOptions: [],
  setAssessmentOptions: (options: AssessmentOptions) => {
    set({ assessmentOptions: options });
  },
  setTechnologyOptions: (options: StatusOption[]) => {
    set({ technologyOptions: options });
  },
  setResultFilter: (filter: ResultFilter) => {
    set({ resultFilter: filter });
  },
  setResultListData: (count: number, list: Result[]) => {
    set({ resultList: list, resultCount: count });
  },
}));
