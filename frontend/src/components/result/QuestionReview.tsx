import { AnswerData } from "@/types/exam.types";
import { questionType } from '@/shared/constants/data'
import VideoPreview from "../video-recording/VideoPreview";
import { FC, memo } from "react";


interface QuestionReviewProps {
  answers: AnswerData[] | null
}

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
        <div className="w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full shadow-sm"></div>
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
                        <code>{((ans.question?.meta.code )) || 'No code snippet provided.'}</code>
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
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam quidem ex sint quibusdam iste, provident nihil quae distinctio officiis voluptatem accusantium facilis blanditiis consectetur necessitatibus esse officia in modi ut?
                      lorem*900
                    </p>
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
                                <source src={ans.question.meta?.video_url} type="video/mp4" />
                              </video>)
                            )}
                          </div>
                        )

                      }
                      <div className="relative">

                        <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">Candidate Answer</p>
                        <VideoPreview videoUrl={ans.user_answer[0]} onError={() => console.error('Video load error')}/>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const StaticIframe: FC<{ html: string }> = memo(({ html }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="flex justify-center" />;
});
StaticIframe.displayName = 'StaticIframe';

export default QuestionReview;