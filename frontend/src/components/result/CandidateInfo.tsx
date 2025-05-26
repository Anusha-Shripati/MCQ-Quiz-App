import { Assessment } from '@/store/assessmentStore'
import { ICandidate } from '@/types/candidate.types'
import { AnswerData, IExam } from '@/types/exam.types'
import React from 'react'

interface CandidateInfoProps {
    candidate: ICandidate | null
    assessment: Assessment | null
    exam: IExam | null
  }

const CandidateInfo: React.FC<CandidateInfoProps> = ({ candidate, assessment, exam }) => (
  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-900 transform transition-all duration-300 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-indigo-50/50 dark:from-gray-900/20 dark:to-indigo-900/20 opacity-50"></div>
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full shadow-sm"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Candidate Information</h2>
      </div>
        <div className="flex flex-wrap gap-2 justify-stretch">
          {[
            { label: 'Name', value: candidate?.name },
            { label: 'Email', value: candidate?.email },
            { label: 'Experience', value: `${candidate?.experience} years` },
            { label: 'Technology', value: assessment?.technologies?.map((tech) => tech.technology.name).join(', ') },
            { label: 'Exam Date', value: new Date(exam?.start_time || '').toLocaleString() }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex-grow bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-3 rounded-xl border border-gray-300 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50/0 via-gray-50/50 to-gray-50/0 dark:from-gray-900/0 dark:via-gray-900/50 dark:to-gray-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-200 relative">{item.label}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-gray-800 dark:group-hover:text-white relative">{item.value}</p>
            </div>
          ))}
      </div>

    </div>
  </div>
)

export default CandidateInfo
