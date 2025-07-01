'use client'
import { AnswerData } from "@/types/exam.types";
import { questionType } from '@/shared/constants/data'
import VideoPreview from "../video-recording/VideoPreview";
import { FC, memo, useState } from "react";
import { Button } from "../ui/form/button";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { FormField } from "../common/form-field";
import { resultEndpoint } from "@/lib/endpoint";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { mutate } from "swr";


interface QuestionReviewProps {
  answers: AnswerData[] | null
}
type Answer = Omit<Required<AnswerData>, 'score'> & { result_id: string; score: string }
const QuestionReview: React.FC<QuestionReviewProps> = ({ answers }) => {

  const [selectedAns, setSelectedAns] = useState<Answer | null>(null)
  const [updatedScore, setUpdatedScore] = useState<number>(0)
  const [scoreError, setScoreError] = useState('')

  const { trigger, isMutating } = useSWRMutation(resultEndpoint.UPDATE_SCORE, () => api.post(resultEndpoint.UPDATE_SCORE, { resultId: selectedAns?.result_id, questionId: selectedAns?.question_id, score: Number(updatedScore) }))

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
  const handleSave = async () => {
    setScoreError('')

    if (isNaN(updatedScore) || !updatedScore) {
      setScoreError(scoreError + ' Please enter valid number')
      return
    }
    if (updatedScore > (selectedAns?.weight || 0)) {
      setScoreError(scoreError + ' Please enter less than its weight')
      return
    }

    if (updatedScore < 0) {
      setScoreError(scoreError + ' Please enter positive socre')
      return
    }
    try {
      await trigger()
      toast.success('Success')
      mutate((url:string)=>url && url.includes(resultEndpoint.RESULT_BY_ID)) 
      setSelectedAns(null)
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message || 'Failed to update')
        return
      }
      toast.error('Failed to update')
    }
  }

  const handleSelection = (ans: Answer) => {
    setUpdatedScore(Number(ans.score))
    setSelectedAns(ans)
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Question Review</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {answers?.map((ans, index) => {

          const level = ans.question?.difficulty_level || 'easy'; // default fallback
          const styles = difficultyStyles[level];
          return (
            <div
              key={ans.id}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-100 dark:hover:border-purple-900 transition-all duration-300 transform hover:scale-[1.01] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20 opacity-50"></div>
              <div className="relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 md:gap-0">
                  {/* Left: Question Index and Difficulty */}
                  <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow">
                      Q{index + 1}
                    </span>
                    <span
                      className={`${styles.bg} ${styles.text} px-3 py-0.5 rounded shadow inline-flex items-center gap-1 text-xs font-semibold select-none`}
                    >
                      <span>{styles.label}</span>
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                    {questionType[ans.question?.type]}
                  </span>

                  <div className="flex items-center gap-3 flex-wrap justify-start md:justify-end">
                    {ans.question?.technology?.name && (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded shadow">
                        {ans.question.technology.name}
                      </span>
                    )}
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-3 py-0.5 rounded-full shadow">
                      Score: {ans.score?.toFixed(2)}
                    </span>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild >
                        <Button
                          variant='ghost'
                          onClick={() =>
                            handleSelection({
                              ...ans,
                              result_id: (ans as any).result_id ?? '',
                              score: String(ans.score ?? 0),
                            } as Answer)
                          }
                        >
                          <Pencil />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Not satisfied with score? Click here to update score</p>
                      </TooltipContent>
                    </Tooltip>
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
                          className={`p-2 rounded-xl border transition-all duration-300 relative overflow-hidden ${isCorrect
                            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                            : isSelected
                              ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-yellow-900/30 text-red-700 dark:text-red-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
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
                {ans.question?.type === 'code_snippet' && ans.question?.meta?.code && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Code Snippet:</p>
                    <pre className="bg-gradient-to-br from-gray-900 to-gray-800 max-h-96 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                      <code>{ans.question?.meta.code || 'No code snippet provided.'}</code>
                    </pre>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1 mt-3">Ans:</p>
                    <pre className=" max-h-96 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                      <p>{ans.user_answer.length ? ans.user_answer[0] : 'No answer provided.'}</p>
                    </pre>
                  </div>
                )}
                {ans.question?.type === 'code_editor' && (
                  <div className="mb-4">
                    {ans.question?.meta?.code && <> <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Code Snippet:</p>
                      <pre className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs max-h-96 overflow-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                        <code>{((ans.question?.meta.code)) || 'No code snippet provided.'}</code>
                      </pre></>}
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1 mt-3">Ans:</p>
                    <pre className="max-h-96 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                      <code>{ans.user_answer.length ? ans.user_answer[0] : 'No answer provided.'}</code>
                    </pre>
                  </div>
                )}
                {ans.question?.type === 'text' && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Candidate Answer:</p>
                    <p className="p-3 rounded-xl text-xs max-h-96 overflow-auto border border-gray-300 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300">
                      {ans.user_answer.length ? ans.user_answer[0] : 'No answer provided.'}
                    </p>
                  </div>
                )}

                {/* Answer Summary */}
                {ans.question?.type == 'multiple_select' && <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-3 rounded-xl border border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/50 to-purple-50/0 dark:from-purple-900/0 dark:via-purple-900/50 dark:to-purple-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="relative">
                    <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">Candidate Answer</p>
                    <p className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                      {Array.isArray(ans.user_answer) ? ans.user_answer.map((item) => ans.question?.options[Number(item)]).filter(item => item).join(', ') : '-'}
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

                {
                  ans.question?.type == 'video' && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-3 rounded-xl border border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/50 to-purple-50/0 dark:from-purple-900/0 dark:via-purple-900/50 dark:to-purple-900/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      {
                        ans.question?.meta?.videoToVideo && (
                          <div className="mb-4">
                            <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">Video to Video</p>
                            {ans.question.meta?.video_url?.includes('iframe') ? (
                              <StaticIframe html={ans.question.meta?.video_url} />
                            ) : (
                              (ans.question?.meta?.videoToVideo && <video controls className="w-full max-h-[400px] rounded-lg shadow">
                                <source src={(process.env.NEXT_PUBLIC_IMGAE_PREFIX || '') + ans.question.meta?.video_url} type="video/mp4" />
                              </video>)
                            )}
                          </div>
                        )

                      }
                      <div className="relative">

                        <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">Candidate Answer</p>
                        <VideoPreview videoUrl={(process.env.NEXT_PUBLIC_IMGAE_PREFIX || '') + ans.user_answer[0]} />
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          )
        })}
      </div>
      <Dialog open={!!selectedAns} onOpenChange={() => setSelectedAns(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Score
            </DialogTitle>
          </DialogHeader>
          <FormField
            label="Score"
            value={updatedScore}
            placeholder="Enter Score"
            className="dark:bg-gray-700"
            error={scoreError}
            onChange={(e) => setUpdatedScore(e.target.value > (selectedAns?.weight || 0) || e.target.value < 0 ? (selectedAns?.score || 0) : e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAns(null)} className="text-gray-900 dark:text-white">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSave} disabled={isMutating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const StaticIframe: FC<{ html: string }> = memo(({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="flex justify-center" />;
});
StaticIframe.displayName = 'StaticIframe';

export default QuestionReview;