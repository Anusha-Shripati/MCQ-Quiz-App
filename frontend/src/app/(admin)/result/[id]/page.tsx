'use client'

import StatusWrapper from '@/components/common/status-wrapper'
import VideoPreview from '@/components/video-recording/VideoPreview'
import { api } from '@/lib/api'
import {  questionType } from '@/shared/constants/data'
import { Assessment } from '@/store/assessmentStore'
import { ICandidate } from '@/types/candidate.types'
import { AnswerData, IExam, Result } from '@/types/exam.types'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'

import * as Tabs from '@radix-ui/react-tabs'
// Types
interface CandidateInfoProps {
  candidate: ICandidate | null
  assessment: Assessment | null
  exam: IExam | null
  introduction: AnswerData | null
}

interface ResultSummaryProps {
  score: number
  total: number
  percentage: number
}

interface QuestionReviewProps {
  answers: AnswerData[] | null
}

// Reusable Components
const CandidateInfo: React.FC<CandidateInfoProps> = ({ candidate, assessment, exam,introduction }) => (
  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-blue-100 dark:border-blue-900 transform hover:scale-[1.01] transition-all duration-300 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-50"></div>
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">Candidate Information</h2>
      </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Name', value: candidate?.name },
            { label: 'Email', value: candidate?.email },
            { label: 'Experience', value: `${candidate?.experience} years` },
            { label: 'Technology', value: assessment?.technologies?.map((tech) => tech.technology.name).join(', ') },
            { label: 'Exam Date', value: new Date(exam?.start_time || '').toLocaleString() }
          ].map((item, index) => (
            <div 
              key={index}
              className=" bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-3 rounded-xl border border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 dark:from-blue-900/0 dark:via-blue-900/50 dark:to-blue-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-200 relative">{item.label}</p>
              <p className="font-medium text-blue-900 dark:text-blue-100 text-sm group-hover:text-blue-800 dark:group-hover:text-white relative">{item.value}</p>
            </div>
          ))}
      </div>

    </div>
  </div>
)

const ResultSummary: React.FC<ResultSummaryProps> = ({ score, total, percentage }) => (
  <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-800 dark:via-purple-800 dark:to-indigo-800 rounded-2xl p-6 mb-6 text-white shadow-xl transform hover:scale-[1.01] transition-all duration-300 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-8 bg-gradient-to-b from-white/50 to-white/20 rounded-full shadow-sm"></div>
        <h3 className="text-lg font-bold">Result Summary</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Score', value: `${score.toFixed(1)} / ${total}` },
          { label: 'Percentage', value: `${percentage.toFixed(2)}%` },
          { label: 'Status', value: percentage >= 60 ? 'Passed' : 'Failed' }
        ].map((item, index) => (
          <div 
            key={index}
            className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <p className="text-xs text-violet-100 mb-1 group-hover:text-white relative">{item.label}</p>
            <p className="text-lg font-bold transition-transform relative">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const QuestionReview: React.FC<QuestionReviewProps> = ({ answers }) => {
  
  const difficultyStyles = {
    hard: {
      label: 'Hard',
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    easy: {
      label: 'Easy',
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
    },
  }
  return (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full shadow-sm"></div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Question Review</h2>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {answers?.map((ans, index) => {

      const level = ans.question?.difficulty_level || 'easy'; // default fallback
      const styles = difficultyStyles[level];
      return(
        <div
          key={ans.id}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300 transform hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 opacity-50"></div>
          <div className="relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 md:gap-0">
            {/* Left: Question Index and Difficulty */}
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow">
                Q{index + 1}
              </span>
              <span
              className={`${styles.bg} ${styles.text} px-3 py-0.5 rounded shadow inline-flex items-center gap-1 text-xs font-semibold select-none`}
            >
              <span>{styles.label}</span>
            </span>
            </div>

            {/* Middle: Question Type */}
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
              {questionType[ans.question?.type]}
            </span>

            {/* Right: Technology & Score */}
            <div className="flex items-center gap-3 flex-wrap justify-start md:justify-end">
              {ans.question?.technology?.name && (
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded shadow">
                  {ans.question.technology.name}
                </span>
              )}
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-3 py-0.5 rounded-full shadow">
                Score: {ans.score?.toFixed(2)}
              </span>
            </div>
          </div>


            <p className="text-gray-800 dark:text-gray-200 text-sm mb-4">{ans.question?.question}</p>

            {/* Options */}
            {ans.question?.options?.length > 0 && (
              <ul className="space-y-2 mb-4">
                {ans.question.options.map((opt, i) => {
                  const isCorrect = ans.question?.correct_answer?.includes(i.toString())
                  const isSelected = ans.user_answer?.includes(i.toString())
                  return (
                    <li
                      key={i}
                      className={`p-2 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        isCorrect
                          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                          : isSelected
                          ? 'border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/30'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 dark:from-gray-800/0 dark:via-gray-800/50 dark:to-gray-800/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <span className="text-sm relative">{opt}</span>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Code Snippet */}
            {ans.question?.type === 'code_snippet' && ans.question.meta?.code && (
              <div className="mb-4">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Code Snippet:</p>
                <pre className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-x-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                  <code>{ans.question.meta.code}</code>
                </pre>
              </div>
            )}

            {/* Answer Summary */}
            {ans.question?.type == 'multiple_select' && <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-3 rounded-xl border border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/50 to-purple-50/0 dark:from-purple-900/0 dark:via-purple-900/50 dark:to-purple-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative">
                <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">Candidate Answer</p>
                <p className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                  {Array.isArray(ans.user_answer)
                    ? ans.user_answer.join(', ')
                    : ans.user_answer || '-'}
                </p>
              </div>
              <div className="relative">
                <p className="text-xs text-indigo-600 dark:text-indigo-300 mb-1">Correct Answer</p>
                <p className="font-medium text-indigo-900 dark:text-indigo-100 text-sm">
                  {Array.isArray(ans.question?.correct_answer)
                    ? ans.question.correct_answer.join(', ')
                    : '-'}
                </p>
              </div>
            </div>}
          </div>
        </div>
      )
    })}
    </div>
  </div>
)}

function Answer() {
  const params = useParams()
  const id = params.id
  const [candidate, setCandidate] = useState<ICandidate | null>(null)
  const [exam, setExam] = useState<IExam | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [answers, setAnswers] = useState<AnswerData[] | null>([])
  const [result, setResult] = useState<Result | null>(null)
  const { data, isLoading, error } = useSWR(`/result/${id}`, api.get)
  const [introduction, setIntroduction] = useState<AnswerData | null>(null)

  useEffect(() => {
    if (data) {
      setCandidate(data.data.exam.candidate)
      setExam(data.data.exam)
      setAssessment(data.data.exam.assessment)
      setAnswers(data.data.answers.filter((ans: AnswerData) => ans.question_id != null))
      setIntroduction(data.data.answers.find((ans: AnswerData) => ans.question_name == 'introduction'))
      setResult(data.data)
    }
  }, [data])

  return (
    <div className="min-h-screen dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <StatusWrapper loading={isLoading} error={error} className="w-full">

          <CandidateInfo 
            candidate={candidate}
            assessment={assessment}
            exam={exam}
            introduction={introduction}
          />

          {result && (
            <ResultSummary
              score={result.score}
              total={result.total}
              percentage={result.percentage}
            />
          )}

          {/* Tabs Section */}
          <Tabs.Root className="mt-8" defaultValue="introduction">
            <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <Tabs.Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="introduction"
              >
                Introduction
              </Tabs.Trigger>
              <Tabs.Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="questions"
              >
                Questions & Answers
              </Tabs.Trigger>
              <Tabs.Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="snapshots"
              >
                Snapshots
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="introduction">
              {introduction ? (
                <div className='flex justify-center items-center flex-col bg-white dark:bg-gray-800 p-6 rounded-xl shadow '>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Introduction Video</h3>
                  <div className="w-[700px]">
                    <VideoPreview videoUrl={introduction.user_answer?.[0] || ''} onError={() => {}} />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No introduction available.</p>
              )}
            </Tabs.Content>

            <Tabs.Content value="questions">
              <QuestionReview answers={answers} />
            </Tabs.Content>

            <Tabs.Content value="snapshots">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-gray-600 dark:text-gray-300">
                <p>Screenshots and Snapshots will be shown here.</p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </StatusWrapper>
      </div>
    </div>
  )
}

export default Answer
