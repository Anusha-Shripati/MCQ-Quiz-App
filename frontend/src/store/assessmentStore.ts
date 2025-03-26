import { create } from 'zustand'

export interface Question {
    easy: number;
    medium: number;
    hard: number;
}

export interface Technology {
    name: string;
    percentage: number;
    questions: Question;
}
export interface Assessment {
    id: string;
    title: string;
    createdBy: string;
    createdDate: string;
    totalQuestions: number;
    duration: string | number | null ;
    technologies: Technology[];
}
export interface AssessmentFilters{
    assessment:string,
    createdBy:string,
    date: Date, 
    view: string 
}
interface AssessmentState {
    assessments: Assessment[];
    currentAssessment: Assessment | null;
    filters:AssessmentFilters;
    isLoading: boolean;
    error: string | null;
    createAssessment: (payload: Omit<Assessment, "id" | "createdDate">) => void;
    updateAssessment: (payload: Assessment) => void;
    deleteAssessment: (id: string) => void;
    setCurrentAssessment: (id: string) => void;
    updateTechnologyQuestions: (payload: {
        assessmentId: string;
        techName: string;
        questions: Technology["questions"];
    }) => void;
    removeTechnology: (payload: { assessmentId: string; techName: string }) => void;
    addTechnology: (payload: { assessmentId: string; technology: Omit<Technology, "questions"> }) => void;
    clearCurrentAssessment: () => void;
    fetchAssessments: () => Promise<Assessment[]>;
    setFilters:(filters:AssessmentFilters)=>void
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
    assessments: [
        {
            id: "mern",
            title: "MERN 3 years",
            createdBy: "MihirBhai",
            createdDate: "20-Jan-2025",
            totalQuestions: 60,
            duration: 60,
            technologies: [
                { name: "MongoDB", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
                { name: "ExpressJs", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
                { name: "ReactJs", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
                { name: "NodeJs", percentage: 25, questions: { easy: 5, medium: 5, hard: 5 } },
            ],
        },
    ],
    filters:{
        assessment:"all",
        createdBy:"all",
        date: new Date(), 
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
    createAssessment: (payload: Omit<Assessment, 'id' | 'createdDate'>) => {
        const newAssessment: Assessment = {
            ...payload,
            id: `assessment-${Date.now()}`, // Generate a unique ID
            createdDate: new Date().toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        };
        set((state) => ({ assessments: [newAssessment, ...state.assessments] }));
    },
    updateAssessment(payload: Assessment) {
        set((state) => ({
            assessments: state.assessments.map((a) => (a.id === payload.id ? payload : a)),
        }));
    },
    deleteAssessment(id: string) {
        set((state) => ({
            assessments: state.assessments.filter((a) => a.id !== id),
        }));
    },
    setCurrentAssessment(id: string) {
        const assessment = get().assessments.find((a) => a.id === id) || null;
        set({ currentAssessment: assessment });
    },
    updateTechnologyQuestions(payload: { assessmentId: string; techName: string; questions: Technology['questions'] }) {
        set((state) => ({
            assessments: state.assessments.map((a) =>
                a.id === payload.assessmentId
                    ? {
                        ...a,
                        technologies: a.technologies.map((t) =>
                            t.name === payload.techName ? { ...t, questions: payload.questions } : t
                        ),
                    }
                    : a
            ),
        }));
    },
    removeTechnology(payload: { assessmentId: string; techName: string }) {
        set((state) => ({
            assessments: state.assessments.map((a) =>
                a.id === payload.assessmentId
                    ? { ...a, technologies: a.technologies.filter((t) => t.name !== payload.techName) }
                    : a
            ),
        }));
    },
    addTechnology(payload: { assessmentId: string; technology: Omit<Technology, 'questions'> }) {
        set((state) => ({
            assessments: state.assessments.map((a) =>
                a.id === payload.assessmentId
                    ? {
                        ...a,
                        technologies: [
                            ...a.technologies,
                            { ...payload.technology, questions: { easy: 0, medium: 0, hard: 0 } },
                        ],
                    }
                    : a
            ),
        }));
    },
    clearCurrentAssessment() {
        set({ currentAssessment: null })
    }
}))