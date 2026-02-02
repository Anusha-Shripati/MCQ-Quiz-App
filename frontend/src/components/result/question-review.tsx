'use client';
import { api } from '@/lib/api';
import { resultEndpoint } from '@/lib/endpoint';
import { questionType } from '@/shared/constants/data';
import { AnswerData } from '@/types/exam.types';
import { isAxiosError } from 'axios';
import { Pencil } from 'lucide-react';
import { FC, memo, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { FormField } from '../common/form-field';
import { QuestionText } from '../common/truncate-question-text';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/form/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import VideoPreview from '../video-recording/VideoPreview';

interface QuestionReviewProps {
  answers: AnswerData[] | null;
}
type Answer = Omit<Required<AnswerData>, 'score'> & { result_id: string; score: string };
const QuestionReview: React.FC<QuestionReviewProps> = ({ answers }) => {
  console.log(answers);
  const [selectedAns, setSelectedAns] = useState<Answer | null>(null);
  const [updatedScore, setUpdatedScore] = useState<number>(0);
  const [scoreError, setScoreError] = useState('');

  const { trigger, isMutating } = useSWRMutation(resultEndpoint.UPDATE_SCORE, () =>
    api.post(resultEndpoint.UPDATE_SCORE, {
      resultId: selectedAns?.result_id,
      questionId: selectedAns?.question_id,
      score: Number(updatedScore),
    })
  );

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
  };
  const handleSave = async () => {
    setScoreError('');

    if (isNaN(updatedScore)) {
      setScoreError(scoreError + ' Please enter valid number');
      return;
    }
    if (updatedScore > (selectedAns?.weight || 0)) {
      setScoreError(scoreError + ' Please enter less than its weight');
      return;
    }

    if (updatedScore < 0) {
      setScoreError(scoreError + ' Please enter positive socre');
      return;
    }
    try {
      await trigger();
      toast.success('Success');
      mutate((url: string) => url && url.includes(resultEndpoint.RESULT_BY_ID));
      setSelectedAns(null);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message || 'Failed to update');
        return;
      }
      toast.error('Failed to update');
    }
  };

  const handleSelection = (ans: Answer) => {
    setUpdatedScore(Number(ans.score));
    setSelectedAns(ans);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    let maxScore = 1; // default for easy
    const difficulty = selectedAns?.question?.difficulty_level;
    if (difficulty === 'medium') maxScore = 2;
    if (difficulty === 'hard') maxScore = 3;

    if (isNaN(value)) {
      setScoreError('Please enter a valid number');
      return;
    }
    if (value > maxScore) {
      setScoreError(`Please enter a value less than or equal to its max score (${maxScore})`);
      return;
    }
    if (value < 0) {
      setScoreError('Please enter a positive score');
      return;
    }
    setScoreError('');
    setUpdatedScore(value);
  };

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
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            handleSelection({
                              ...ans,
                              result_id: (ans as AnswerData).result_id ?? '',
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

                <QuestionText text={ans.question?.question || ''} wordLimit={50} charLimit={200} />

                {/* MCQ and Multiple Select - Show options with visual indicators */}
                {(ans.question?.type === 'mcq' ||
                  ans.question?.type === 'multiple_select' ||
                  ans.question?.type === 'code_snippet_with_mcq' ||
                  ans.question?.type === 'code_snippet') && (
                  <>
                    {/* Code snippet for code_snippet_with_mcq */}
                    {(ans.question?.type === 'code_snippet_with_mcq' ||
                      ans.question?.type === 'code_snippet') &&
                      ans.question?.meta?.code && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                            Code Snippet:
                          </p>
                          <pre className="bg-gradient-to-br from-gray-900 to-gray-800 max-h-96 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                            <code>{ans.question.meta.code}</code>
                          </pre>
                        </div>
                      )}

                    {/* Options with clear visual indicators */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Answer Options:
                      </p>
                      <ul className="space-y-2">
                        {ans.question.options?.map((opt, i) => {
                          const isCorrect = ans.question?.correct_answer?.includes(i.toString());
                          const isSelected = ans.user_answer?.includes(i.toString());

                          return (
                            <li
                              key={i}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 relative ${
                                isCorrect && isSelected
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400'
                                  : isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400'
                                    : isSelected
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-400'
                                      : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                                  {opt}
                                </span>
                                <div className="flex gap-1 flex-shrink-0">
                                  {isCorrect && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500 text-white">
                                      ✓ Correct
                                    </span>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                                      ✗ Candidate Answer
                                    </span>
                                  )}
                                  {isSelected && isCorrect && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                      Candidate Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}

                {/* Code Snippet (without MCQ) */}
                {/* {ans.question?.type === 'code_snippet' && (
                  <div className="mb-4 space-y-3">
                    {ans.question?.meta?.code && (
                      <div>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                          Code Snippet:
                        </p>
                        <pre className="bg-gradient-to-br from-gray-900 to-gray-800 max-h-96 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-auto border border-gray-700 dark:border-gray-600 shadow-lg">
                          <code>{ans.question.meta.code}</code>
                        </pre>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Candidate Answer:
                      </p>
                      <pre className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl text-xs max-h-96 overflow-auto shadow">
                        <code>
                          {ans.user_answer.length ? ans.user_answer[0] : 'No answer provided.'}
                        </code>
                      </pre>
                    </div>
                  </div>
                )} */}

                {/* Code Editor */}
                {ans.question?.type === 'code_editor' && (
                  <div className="mb-4 space-y-3">
                    {ans.question?.meta?.code && (
                      <div>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                          Code Snippet:
                        </p>
                        <pre className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs max-h-96 overflow-auto border border-gray-700 dark:border-gray-600 shadow-lg">
                          <code>{ans.question.meta.code}</code>
                        </pre>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Candidate Answer:
                      </p>
                      <pre className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl text-xs max-h-96 overflow-auto shadow">
                        <code>
                          {ans.user_answer.length ? ans.user_answer[0] : 'No answer provided.'}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Text Answer */}
                {ans.question?.type === 'text' && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Candidate Answer:
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 p-3 rounded-xl text-sm max-h-96 overflow-auto shadow">
                      {ans.user_answer.length ? ans.user_answer[0] : 'No answer provided.'}
                    </div>
                  </div>
                )}

                {/* Video Answer */}
                {ans.question?.type === 'video' && (
                  <div className="mb-4 space-y-3">
                    {ans.question?.meta?.videoToVideo && (
                      <div>
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                          Reference Video:
                        </p>
                        {ans.question.meta?.video_url?.includes('iframe') ? (
                          <StaticIframe html={ans.question.meta?.video_url} />
                        ) : (
                          ans.question?.meta?.videoToVideo && (
                            <video
                              controls
                              className="w-full max-h-[400px] rounded-lg shadow border-2 border-gray-300 dark:border-gray-600"
                            >
                              <source
                                src={
                                  (process.env.NEXT_PUBLIC_IMGAE_PREFIX || '') +
                                  ans.question.meta?.video_url
                                }
                                type="video/mp4"
                              />
                            </video>
                          )
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Your Video Answer:
                      </p>
                      {ans.user_answer && ans.user_answer.length ? (
                        <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg overflow-hidden shadow">
                          <VideoPreview
                            videoUrl={
                              (process.env.NEXT_PUBLIC_IMGAE_PREFIX || '') + ans.user_answer[0]
                            }
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 min-h-[300px] flex justify-center items-center rounded-xl border-2 border-gray-300 dark:border-gray-600">
                          Video is uploading...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
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
            onChange={handleScoreChange}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedAns(null)}
              className="text-gray-900 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSave}
              disabled={isMutating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StaticIframe: FC<{ html: string }> = memo(({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="flex justify-center" />;
});
StaticIframe.displayName = 'StaticIframe';

export default QuestionReview;
