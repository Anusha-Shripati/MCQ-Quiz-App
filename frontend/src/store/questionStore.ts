import { create } from 'zustand'

interface Questions {
    technology_id: string
    question: string
    correct_answer: string
    options: any
    time: string
    difficulty_level: 'easy' | 'medium' | 'hard';
    type: 'multiple_select' | 'video' | 'text' | 'mcq';
    meta: any
}

interface QuestionStore {
    questionFilter: string
    questionCount: number
    questionList: Questions[]
    setQuestionFilter: (filter: string) => void
    setQuestionListData: (count: number, list: Questions[]) => void
}

export const useQuestionStore = create<QuestionStore>((set) => ({
    questionFilter: "",
    questionCount: 0,
    questionList: [],
    setQuestionFilter: (filter: string) => {
        set({ questionFilter: filter })
    },
    setQuestionListData: (count: number, list: Questions[]) => {
        set({ questionList: list, questionCount: count })
    },
}))