import { CandidateFilter } from '@/types/candidate.types'
import { Candidate } from '@/types/candidate.types'
import { StatusOption } from '@/types/common.types'
import { create } from 'zustand'


interface CandidateStore {
    candidateFilter: CandidateFilter
    candidateCount: number
    candidateList: Candidate[]
    setCandidateFilter:(filter:CandidateFilter)=>void
    setCandidateListData:(count:number, list: Candidate[])=>void
    assessmentOptions:StatusOption[]
    technologyOptions:StatusOption[]
    setAssessmentOptions:(options:StatusOption[])=>void
    setTechnologyOptions:(options:StatusOption[])=>void
}


export const useCandidateStore = create<CandidateStore>((set) => ({
    candidateFilter: {
        searchQuery: "",
        technologyFilter: [],
        assessmentFilter: [],
        created: {
            days: "",
            range: undefined
        },
    },
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
	setCandidateFilter: (filter: CandidateFilter) => {
		set({ candidateFilter: filter })
	},
    setCandidateListData: (count: number, list: Candidate[]) => {
        set({ candidateList: list, candidateCount: count })
    },
}))