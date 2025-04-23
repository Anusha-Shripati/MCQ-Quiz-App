import { CandidateFilter } from '@/types/candidate.types'
import { ICandidate } from '@/types/candidate.types'
import { StatusOption } from '@/types/common.types'
import { create } from 'zustand'

export type CandidateAssessmentOptions = (StatusOption & { technologies?: { id: string; name: string }[] })[];

  

interface CandidateStore {
    candidateFilter: CandidateFilter
    candidateCount: number
    candidateList: ICandidate[]
    setCandidateFilter:(filter:CandidateFilter)=>void
    setCandidateListData:(count:number, list: ICandidate[])=>void
    assessmentOptions:CandidateAssessmentOptions
    technologyOptions:StatusOption[]
    setAssessmentOptions:(options:CandidateAssessmentOptions)=>void
    setTechnologyOptions:(options:StatusOption[])=>void
}
const candidateAssessmentOptions: CandidateAssessmentOptions = [];

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
    assessmentOptions: candidateAssessmentOptions,
    technologyOptions: [],
    setAssessmentOptions: (options: CandidateAssessmentOptions) => {
        set({ assessmentOptions: options })
    },
	setTechnologyOptions: (options: StatusOption[]) => {
		set({ technologyOptions: options })
	},
	setCandidateFilter: (filter: CandidateFilter) => {
		set({ candidateFilter: filter })
	},
    setCandidateListData: (count: number, list: ICandidate[]) => {
        set({ candidateList: list, candidateCount: count })
    },
}))