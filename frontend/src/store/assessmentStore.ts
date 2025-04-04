import { DateRange } from '@/types/common.types';
import { create } from 'zustand'

export interface Question {
    easy: number;
    medium: number;
    hard: number;
}

export interface Technology {
    id?:string;
    technology:{
        id: string;
        name: string;
    },
    technology_id?: string;
    hard: number;
    easy: number;
    medium: number;
}
export interface Assessment {
    id?: string;
    name: string;
    created_by: string;
    created_at: string;
    totalQuestions: number;
    duration: string | number ;
    technologies: Technology[];
    created_by_user:{
        id:string,
        name:string
    }
}
export interface AssessmentFilters{
    name:string,
    created_by:string,
    created_duation: DateRange | undefined, 
    view: string 
}
interface AssessmentState {
    assessments: Assessment[];
    currentAssessment: Assessment | null;
    filters:AssessmentFilters;
    isLoading: boolean;
    error: string | null;
    setCurrentAssessment: (assessment: Assessment) => void;
    clearCurrentAssessment: () => void;
    fetchAssessments: () => Promise<Assessment[]>;
    setFilters:(filters:AssessmentFilters)=>void
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
    assessments: [],
    filters:{
        name:"",
        created_by:"all",
        created_duation: undefined, 
        view: 'today' 
    },
    currentAssessment: null,
    isLoading: false,
    error: null,
    fetchAssessments: () => {
        console.log('opopop');
        
        return new Promise((resolve) => {
            const assessments = get().assessments
            resolve(assessments)
        })
    },
    setFilters:(filters:AssessmentFilters)=>{
        set({filters})
    },
    setCurrentAssessment(assessment: Assessment) {
        set({ currentAssessment: assessment });
    },
    clearCurrentAssessment() {
        set({ currentAssessment: null })
    }
}))