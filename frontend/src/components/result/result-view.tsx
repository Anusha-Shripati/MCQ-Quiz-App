'use client';

import StatusWrapper from '@/components/common/status-wrapper';
import VideoPreview from '@/components/video-recording/VideoPreview';
import { api } from '@/lib/api';
import { Assessment } from '@/store/assessmentStore';
import { ICandidate } from '@/types/candidate.types';
import { AnswerData, IExam, Result } from '@/types/exam.types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import CandidateInfo from '@/components/result/candidate-info';
import ResultSummary from '@/components/result/result-summary';
import QuestionReview from '@/components/result/question-review';
import Snapshots from '@/components/result/snapshots';
import { Content, List, Tabs, Trigger } from '@/components/ui/form/tabs';
import { resultEndpoint } from '@/lib/endpoint';
import Image from 'next/image';
import Feedback from './feedback';

function Answer() {
  const params = useParams();
  const id = params.id;
  const [candidate, setCandidate] = useState<ICandidate | null>(null);
  const [exam, setExam] = useState<IExam | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<AnswerData[] | null>([]);
  const [result, setResult] = useState<Result | null>(null);
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    `${resultEndpoint.RESULT_BY_ID}/${id}`,
    api.get
  );
  const [introduction, setIntroduction] = useState<AnswerData | null>(null);
  const [activeTab, setActiveTab] = useState('introduction');

  useEffect(() => {
    if (data) {
      setCandidate(data.data.exam.candidate);
      setExam(data.data.exam);
      setAssessment(data.data.exam.assessment);
      setAnswers(data.data.answers.filter((ans: AnswerData) => ans.question_id != null));
      setIntroduction(
        data.data.answers.find((ans: AnswerData) => ans.question_name == 'introduction')
      );
      setResult(data.data);
    }
  }, [data]);

  return (
    <div className="min-h-screen dark:bg-background py-6 px-9 sm:px-6 lg:px-8">
      <div className="max-w-10xl mx-auto">
        <StatusWrapper
          loading={isLoading || isValidating}
          error={error}
          reset={mutate}
          className="w-full"
        >
          <CandidateInfo candidate={candidate} assessment={assessment} exam={exam} />

          {result && (
            <ResultSummary
              score={result.score}
              total={result.total}
              percentage={result.percentage}
              technologies={exam?.meta?.tech_score || []}
              passCriteria={assessment?.pass_criteria || 0}
              is_passed={result.is_passed}
            />
          )}

          <Tabs className="mt-8" value={activeTab} onValueChange={setActiveTab}>
            <List className="flex border-b border-gray-200 dark:border-border mb-6">
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
              <Trigger
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
                value="feedback"
              >
                Feedback
              </Trigger>
            </List>

            <Content value="introduction">
              <div className="flex items-center mb-8 gap-5">
                <div>
                  {introduction ? (
                    <div className="flex flex-col items-center bg-white dark:bg-primary p-8 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Introduction Video
                      </h3>

                      <div className="w-full aspect-video max-w-xl mb-4 relative">
                        {introduction.user_answer?.[0] ? (
                          <VideoPreview
                            videoUrl={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${introduction.user_answer[0]}`}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-secondary rounded">
                            <svg
                              className="w-16 h-16 text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"
                              />
                            </svg>
                            <span className="text-gray-500 dark:text-gray-400">
                              Video is uploading...
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        This video was recorded as part of the candidate's introduction.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-white dark:bg-primary p-8 rounded-xl shadow-md w-full max-w-2xl mx-auto">
                      <svg
                        className="w-16 h-16 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"
                        />
                      </svg>

                      <p className="text-gray-500 dark:text-gray-400">No introduction available.</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center bg-white dark:bg-primary p-7 rounded-xl shadow-md w-full max-w-2xl mx-auto ">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Verified Image
                  </h3>

                  {exam?.verified_image ? (
                    <div className="w-full aspect-video max-w-xl mb-4 relative">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMGAE_PREFIX}${exam.verified_image}`}
                        alt="Verified Image"
                        className="w-full object-cover rounded-lg shadow-md"
                        height={190}
                        width={270}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        This image was verified during the verification process.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full aspect-video max-w-xl mb-4 bg-gray-100 dark:bg-secondary rounded-lg">
                      <svg
                        className="w-16 h-16 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z"
                        />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400">
                        No verified image available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Content>

            <Content value="questions">
              <QuestionReview answers={answers} />
            </Content>

            <Content value="snapshots">
              <Snapshots
                camera={exam?.meta?.camera || []}
                screenshots={exam?.meta?.screenshots || []}
                integrityEvidence={exam?.meta?.integrityEvidence}
                violations={exam?.meta?.violations || []}
              />
            </Content>
            <Content value="feedback">
              <Feedback resultId={id as string} />
            </Content>
          </Tabs>
        </StatusWrapper>
      </div>
    </div>
  );
}

export default Answer;
