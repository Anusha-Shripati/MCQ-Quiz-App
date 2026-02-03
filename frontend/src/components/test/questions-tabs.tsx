import React from 'react';
import { IExamQuestion } from '@/types/exam.types';

interface QuestionTabsProps {
  questions: IExamQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answeredQuestions: Record<string, any>;
  visitedQuestions: Set<string>;
}

function QuestionTabs({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answeredQuestions,
  visitedQuestions,
}: QuestionTabsProps) {
  return (
    <div className="md:w-64 flex-shrink-0">
      <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-3xl shadow-xl border-2 border-gray-200/50 sticky top-4">
        <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-gray-300/50 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Questions
        </h3>
        <div className="grid grid-cols-3 gap-2.5 max-h-[45vh] overflow-y-auto p-2 custom-scrollbar">
          {questions.map((q, index) => {
            const isAnswered = answeredQuestions[q.question_id];
            const isVisited = visitedQuestions.has(q.question_id);
            const isCurrent = currentQuestionIndex === index;

            let bgColor = 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-300'; // Not visited
            let shadowClass = 'shadow-sm';
            
            if (isAnswered) {
              bgColor = 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-2 border-green-600';
              shadowClass = 'shadow-lg shadow-green-200';
            } else if (isVisited) {
              bgColor = 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-2 border-yellow-600';
              shadowClass = 'shadow-lg shadow-yellow-200';
            }

            return (
              <button
                key={q.question_id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-14 w-14 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-300 hover:scale-105 ${
                  isCurrent ? 'ring-4 ring-blue-500 scale-105 shadow-2xl' : shadowClass
                } ${bgColor}`}
                aria-label={`Go to question ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        {/* Legend */}
        <div className="mt-6 pt-5 border-t-2 border-gray-300/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg border-2 border-green-600"></div>
            <span className="text-sm text-gray-700 font-semibold">Answered</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg border-2 border-yellow-600"></div>
            <span className="text-sm text-gray-700 font-semibold">Not Answered</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-white shadow-md border-2 border-gray-300"></div>
            <span className="text-sm text-gray-700 font-semibold">Not Visited</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionTabs;
