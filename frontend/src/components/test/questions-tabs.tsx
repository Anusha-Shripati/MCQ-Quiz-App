import React from 'react';
import { IExamQuestion } from '@/types/exam.types';

interface QuestionTabsProps {
  questions: IExamQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answeredQuestions: Record<string, any>;
  visitedQuestions: Set<string>;
  violations: number;
  maxViolations: number;
  totalAnswered: number;
}

function QuestionTabs({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answeredQuestions,
  visitedQuestions,
  violations,
  maxViolations,
  totalAnswered,
}: QuestionTabsProps) {
  const legendItems = [
    {
      label: 'Answered',
      bgClass: 'bg-gradient-to-br from-green-500 to-green-600',
      borderClass: 'border-green-600',
    },
    {
      label: 'Not Answered',
      bgClass: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
      borderClass: 'border-yellow-600',
    },
    {
      label: 'Not Visited',
      bgClass: 'bg-white',
      borderClass: 'border-gray-300',
    },
  ];

  const percentage = (totalAnswered / questions.length) * 100;
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="md:w-64 flex-shrink-0">
      <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-3xl shadow-xl border-2 border-gray-200/50 sticky top-4 space-y-4">
        {/* Violations Section */}
        <div className="bg-white/80 px-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Violations</span>
            <span
              className={`text-lg font-bold ${
                violations >= maxViolations - 2 ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {violations} / {maxViolations}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300/50"></div>

        {/* Questions Section */}
        <div>
          <div className="flex items-center justify-between ">
            <h3 className="text-xl font-bold text-gray-800 flex items-center ">
              {/* <span className="text-2xl">📋</span> */}
              Questions
            </h3>
            {/* Horizontal bar - commented */}
            {/* <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-600 font-medium">{totalAnswered} / {questions.length}</span>
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
                ></div>
              </div>
            </div> */}

            {/* Circular progress */}
            <div className="relative w-12 h-12 -mt-2">
              <svg className="transform -rotate-90 w-12 h-12">
                <circle cx="24" cy="24" r="16" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                <circle
                  cx="24"
                  cy="24"
                  r="16"
                  stroke="#2563eb"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-700">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2.5 max-h-[45vh] overflow-y-auto p-2 custom-scrollbar">
            {questions.map((q, index) => {
              const isAnswered = answeredQuestions[q.question_id];
              const isVisited = visitedQuestions.has(q.question_id);
              const isCurrent = currentQuestionIndex === index;

              let bgColor = 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-300'; // Not visited
              let shadowClass = 'shadow-sm';

              if (isAnswered) {
                bgColor =
                  'bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-2 border-green-600';
                shadowClass = 'shadow-lg shadow-green-200';
              } else if (isVisited) {
                bgColor =
                  'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-2 border-yellow-600';
                shadowClass = 'shadow-lg shadow-yellow-200';
              }

              return (
                <button
                  key={q.question_id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-300 hover:scale-105 ${
                    isCurrent ? 'ring-2 ring-blue-500 scale-105 shadow-2xl' : shadowClass
                  } ${bgColor}`}
                  aria-label={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t-2 border-gray-300/50 space-y-1">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded-xl ${item.bgClass} shadow-lg border-2 ${item.borderClass}`}
              ></div>
              <span className="text-sm text-gray-700 font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionTabs;
