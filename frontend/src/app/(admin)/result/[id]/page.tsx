'use client'

import StatusWrapper from '@/components/common/status-wrapper'
import VideoPreview from '@/components/video-recording/VideoPreview'
import { api } from '@/lib/api'
import { Assessment } from '@/store/assessmentStore'
import { ICandidate } from '@/types/candidate.types'
import { AnswerData, IExam, Result } from '@/types/exam.types'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'

import CandidateInfo from '@/components/result/CandidateInfo'
import ResultSummary from '@/components/result/ResultSummary'
import QuestionReview from '@/components/result/QuestionReview'
import Snapshots from '@/components/result/Snapshots'
import { Content, List, Tabs, Trigger } from '@/components/ui/form/tabs'


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
              technologies={exam?.meta?.tech_score || []}
            />
          )}

          <Tabs className="mt-8" defaultValue="introduction">
            <List className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="introduction"
              >
                Introduction
              </Trigger>
              <Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="questions"
              >
                Questions & Answers
              </Trigger>
              <Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="snapshots"
              >
                Snapshots
              </Trigger>
            </List>

            <Content value="introduction">
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
            </Content>

            <Content value="questions">
              <QuestionReview answers={answers} />
            </Content>

            <Content value="snapshots">
              <Snapshots camera={exam?.meta?.camera || []} screenshots={exam?.meta?.screenshots || []}/>
            </Content>
          </Tabs>
        </StatusWrapper>
      </div>
    </div>
  )
}

export default Answer
