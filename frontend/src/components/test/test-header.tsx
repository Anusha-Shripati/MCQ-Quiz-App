import React, { useEffect, useState } from 'react';
import { CardHeader, CardTitle } from '../ui/card';
import { BookOpenIcon, CalendarRange, Check, Loader2, TimerIcon } from 'lucide-react';
import { Button } from '../ui/form/button';

function TestHeader({
  submitQuiz,
  timeLeft,
  currentQuestionIndex,
  totalQuestion,
  handleTimerEnd,
  isMutating,
  isSubmiting,
  answeredQuestionsCount,
}: {
  timeLeft: number;
  currentQuestionIndex: number;
  totalQuestion: number;
  handleTimerEnd: () => void;
  submitQuiz: () => void;
  isMutating?: boolean;
  isSubmiting?: boolean;
  answeredQuestionsCount: number;
}) {
  const [seconds, setSeconds] = useState(0);
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins <= 0 && secs <= 0) {
      return 'Time Up!';
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  useEffect(() => {
    if (timeLeft - seconds <= 0) {
      handleTimerEnd();
    }
  }, [seconds, timeLeft, handleTimerEnd]);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardHeader className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 px-4 md:px-8 py-3 border-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
        <div className="flex items-center gap-3 ">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <BookOpenIcon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-blue-800 tracking-tight">
            Proctored Exam
          </CardTitle>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex justify-center">
            <Button
              onClick={() => submitQuiz()}
              disabled={isMutating || isSubmiting || answeredQuestionsCount < totalQuestion}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-md rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 w-40 h-10"
              title={
                answeredQuestionsCount < totalQuestion
                  ? `Complete all ${totalQuestion} questions to submit`
                  : 'Submit your quiz'
              }
            >
              {isMutating || isSubmiting ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : (
                <>
                  Submit Quiz
                  <Check />
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 bg-red-50 text-red-700 px-6 py-2 rounded-full border border-red-200 shadow-sm h-10 min-w-[120px]">
            <TimerIcon className="h-4 w-4" />
            <span className="text-md font-mono font-semibold tabular-nums">
              {formatTime(timeLeft - seconds)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-6 py-2 rounded-full border border-blue-200 shadow-sm h-10 min-w-[120px]">
            <CalendarRange className="h-4 w-4" />
            <span className="font-semibold">
              Q{currentQuestionIndex + 1} of {totalQuestion}
            </span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

export default TestHeader;
