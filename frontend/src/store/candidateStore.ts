import { StatusOption } from '@/types/common.types'
import { create } from 'zustand'


interface CandidateStore {
    candidateFilter: any
    candidateCount: number
    candidateList: any[]
    setCandidateFilter:(filter:any)=>void
    setCandidateListData:(count:number, list: any[])=>void
    assessmentOptions:StatusOption[]
    technologyOptions:StatusOption[]
    setAssessmentOptions:(options:StatusOption[])=>void
    setTechnologyOptions:(options:StatusOption[])=>void
}


export const useCandidateStore = create<CandidateStore>((set) => ({
    candidateFilter: "",
    candidateCount: 0,
    candidateList: [],
    assessmentOptions: [],
    technologyOptions: [],
    setAssessmentOptions: (options: StatusOption[]) => {
        set({ assessmentOptions: options })
    },
    setTechnologyOptions: (options: StatusOption[]) => {
        set({ technologyOptions: options })
    },
    setCandidateFilter: (filter: any) => {
        set({ candidateFilter: filter })
    },
    setCandidateListData: (count: number, list: any[]) => {
        set({ candidateList: list, candidateCount: count })
    },
}))