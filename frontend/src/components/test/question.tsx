import EditorPage from '@/components/editor/page';
import { Answer, IExamQuestion, QuestionType } from '@/types/exam.types';
import { Checkbox } from '../ui/form/checkbox';
import { Radio, RadioGroup } from '../ui/form/radio';
import { Textarea } from '../ui/form/textarea';
import { VideoRecorderQuestion } from './video-recorder-question';

interface QuestionProps {
  question: IExamQuestion;
  answers: Record<string, { question: IExamQuestion; answer: Answer }>;
  handleAnswerChange: (question: IExamQuestion, answer: Answer) => void;
  handleStopRecording: (blob: Blob | null, url: string) => void;
  handleNextQuestion: () => void;
  isLoading: boolean;
  isLocked?: boolean;
}

function Question({
  question,
  answers,
  handleAnswerChange,
  handleStopRecording,
  handleNextQuestion,
  isLoading,
  isLocked,
}: QuestionProps) {
  return (
    <div>
      {isLocked && (
        <div className="mb-4 p-2 text-sm text-gray-600 bg-gray-100 rounded">
          Answer already submitted. No changes allowed.
        </div>
      )}

      {(() => {
        switch (question.question.type) {
          case QuestionType.MCQ:
            return (
              <RadioGroup
                value={(answers[question.question_id]?.answer as string) || ''}
                onValueChange={(value) => !isLocked && handleAnswerChange(question, value)}
                className="space-y-4"
                disabled={isLocked}
              >
                {question.question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <Radio value={`${idx}`} id={`option-${question.question_id}-${idx}`} />
                    <label
                      htmlFor={`option-${question.question_id}-${idx}`}
                      className="text-lg font-semibold text-gray-800 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            );

          case QuestionType.CODE_SNIPPET_WITH_MCQ:
            return (
              <div className="space-y-4">
                {typeof question.question?.meta?.code === 'string' && (
                  <pre className="max-h-96 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-x-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                    <code>{question.question?.meta.code || 'No code snippet provided.'}</code>
                  </pre>
                )}
                <RadioGroup
                  value={(answers[question.question_id]?.answer as string) || ''}
                  onValueChange={(value) => !isLocked && handleAnswerChange(question, value)}
                  className="space-y-4"
                  disabled={isLocked}
                >
                  {question.question.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Radio value={`${idx}`} id={`option-${question.question_id}-${idx}`} />
                      <label
                        htmlFor={`option-${question.question_id}-${idx}`}
                        className="text-lg font-semibold text-gray-800 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );

          case QuestionType.VIDEO:
            return (
              <>
                {isLocked ? (
                  <p className="text-gray-500 italic">
                    Video answer already submitted. Recording disabled.
                  </p>
                ) : (
                  <VideoRecorderQuestion
                    isLoading={isLoading}
                    question={question}
                    answers={answers}
                    onRecordingStop={(blob, url) => !isLocked && handleStopRecording(blob, url)}
                    onRecordingComplete={() => !isLocked && handleNextQuestion()}
                  />
                )}
              </>
            );
          case QuestionType.MULTIPLE_SELECT:
            return (
              <div className="space-y-4">
                {question.question.options?.map((option, idx) => {
                  const currentAnswers = answers[question.question_id]
                    ? (answers[question.question_id]?.answer as (string | number)[])
                    : [];

                  return (
                    <div key={idx} className="flex items-center space-x-3">
                      <Checkbox
                        id={`option-${question.question_id}-${idx}`}
                        checked={currentAnswers.includes(idx.toString())}
                        onCheckedChange={(checked) => {
                          if (isLocked) return;
                          const newAnswers: (string | number)[] = checked
                            ? [...currentAnswers, idx.toString()]
                            : currentAnswers.filter((a) => a !== idx.toString());
                          handleAnswerChange(question, newAnswers);
                        }}
                        disabled={isLocked}
                      />
                      <label
                        htmlFor={`option-${question.question_id}-${idx}`}
                        className="text-lg font-semibold text-gray-800 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
            );

          case QuestionType.TEXT:
            return (
                <Textarea
                  value={(answers[question.question_id]?.answer as string) || ''}
                  onChange={(e) => !isLocked && handleAnswerChange(question, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[120px] text-lg"
                  disabled={isLocked}
                />
            );

          case QuestionType.CODE_SNIPPET:
            return (
              <div className="space-y-2">
                {typeof question.question?.meta?.code === 'string' && (
                  <pre className="max-h-96 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-x-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                    <code>{question.question?.meta.code || 'No code snippet provided.'}</code>
                  </pre>
                )}
                <Textarea
                  value={(answers[question.question_id]?.answer as string) || ''}
                  onChange={(e) => !isLocked && handleAnswerChange(question, e.target.value)}
                  placeholder="Write your code here..."
                  className="min-h-[200px] font-mono text-black text-base"
                  disabled={isLocked}
                />
                <div className="text-sm text-gray-500">
                  Tip: Use proper indentation and comments where necessary
                </div>
              </div>
            );

          case QuestionType.CODE_EDITOR:
            return (
              <div className="space-y-2">
                {typeof question.question?.meta?.code === 'string' && (
                  <pre className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-gray-100 p-3 rounded-xl text-xs overflow-x-auto border border-gray-700 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-500 transition-colors duration-300 shadow-lg">
                    <code>{question.question?.meta.code || 'No code snippet provided.'}</code>
                  </pre>
                )}
                <EditorPage
                  key={question.question_id}
                  onChange={(value) => !isLocked && handleAnswerChange(question, value)}
                  value={(answers[question.question_id]?.answer as string) || ''}
                  questionId={question.question_id}
                  isLocked={isLocked}
                />
                <div className="text-sm text-gray-500">
                  Tip: Use proper indentation and comments where necessary
                </div>
              </div>
            );

          default:
            return <div className="text-red-500">Unsupported question type</div>;
        }
      })()}
    </div>
  );
}
export default Question;