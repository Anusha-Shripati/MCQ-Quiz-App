import { QUIZ_CONFIG } from '@/shared/constants/data'
import { Assessment } from '@/store/assessmentStore'
import { ICandidate } from '@/types/candidate.types'
import { IExam } from '@/types/exam.types'
import dayjs from 'dayjs'
import React from 'react'
import { HiBriefcase, HiCalendar, HiChip, HiMail, HiUser } from 'react-icons/hi'

interface CandidateInfoProps {
  candidate: ICandidate | null
  assessment: Assessment | null
  exam: IExam | null
}

const infoFields = [
  { label: 'Name', icon: <HiUser className="text-indigo-500" />, key: 'name' },
  { label: 'Email', icon: <HiMail className="text-indigo-500" />, key: 'email' },
  { label: 'Experience', icon: <HiBriefcase className="text-indigo-500" />, key: 'experience' },
  { label: 'Technology', icon: <HiChip className="text-indigo-500" />, key: 'technology' },
  { label: 'Exam Date', icon: <HiCalendar className="text-indigo-500" />, key: 'examDate' },
]

const CandidateInfo: React.FC<CandidateInfoProps> = ({ candidate, assessment, exam }) => {
  const values: Record<string, string> = {
    name: candidate?.name || 'N/A',
    email: candidate?.email || 'N/A',
    experience: candidate?.experience ? `${candidate.experience} years` : 'N/A',
    technology: assessment?.technologies?.map((tech) => tech.technology.name).join(', ') || 'N/A',
    examDate: exam?.start_time ? dayjs(exam.start_time).format('DD/MM/YYYY h:m A') : 'N/A',
  }

  return (
    <div className="relative bg-white dark:bg-primary rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-indigo-100/30 dark:from-gray-900/30 dark:to-indigo-900/20 opacity-60 pointer-events-none"></div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-400 rounded-full shadow-sm"></div>
          <div className="flex items-center w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Candidate Information
            </h2>
            {Array.isArray(exam?.meta?.violations) &&
              exam.meta.violations.length > QUIZ_CONFIG.maxViolations && (
                <span className="ml-auto text-red-600 font-semibold text-sm">
                  (This candidate has breached the maximum allowed violations)
                </span>
              )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {infoFields.map((field) => (
            <div
              key={field.key}
              className="flex flex-grow items-center gap-4 bg-white/80 dark:bg-secondary/80 backdrop-blur p-4 rounded-xl border border-gray-200 dark:border-border hover:shadow-lg transition-all duration-300 group"
            >
              <span className="flex-shrink-0 text-xl">{field.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {field.label}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-base group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition break-all">
                  {values[field.key]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CandidateInfo