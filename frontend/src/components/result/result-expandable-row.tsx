'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatTestDuration } from '@/lib/utils';
import { QUIZ_CONFIG } from '@/shared/constants/data';
import { StatusOption } from '@/types/common.types';
import { ExamMetaTech, Result } from '@/types/exam.types';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import React from 'react';
import { Button } from '../ui/form/button';
import { useRouter } from 'next/navigation';

interface ResultExpandableRowProps {
  row: Result;
  technologyOptions: StatusOption[];
}

const ResultExpandableRow: React.FC<ResultExpandableRowProps> = ({ row, technologyOptions }) => {
  const router = useRouter();

  const formatTestDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${startTime}–${endTime}`;
  };

  const getTechnology = (id: string) => {
    const technology = technologyOptions.find((item) => item.value === id);
    if (technology) return technology.label;
    return '-';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-xl shadow-sm space-y-6 transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95">
      {/* Result Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Result Score Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex flex-col shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Result Score
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {row?.percentage?.toFixed(2)}%{' '}
            {Array.isArray(row?.exam?.meta?.violations) &&
              row.exam.meta.violations.length > QUIZ_CONFIG.maxViolations && (
                <span className="ml-2 text-red-600 font-semibold text-sm">
                  (Maximum violations detected)
                </span>
              )}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {row?.score?.toFixed(1)} / {row?.total}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                row?.is_passed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}
            >
              {row?.is_passed ? 'PASSED' : 'FAILED'}
            </span>
            <span className="inline-block text-muted-foreground px-3 py-1 rounded-md text-sm font-medium">
              Passing Score: {row?.pass_criteria}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              className={`w-full rounded-full h-2 ${
                row?.is_passed ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
              }`}
              style={{ width: `${Math.min(row?.percentage || 0, 100)}%` }}
            />
          </div>
          <Button
            onClick={() => {
              router.push(`/results/${row.id}`);
            }}
            variant="outline"
            className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:text-white hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 mt-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>{' '}
            View Detailed Report
          </Button>
        </div>

        {/* Test Time Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex flex-col shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Test Duration
          </div>
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {formatTestDuration(
                    row?.exam?.start_time as string,
                    row?.exam?.end_time as string
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                <p className="font-medium">Test Time Frame</p>
                <p>
                  {formatTestDateRange(
                    row?.exam?.start_time as string,
                    row?.exam?.end_time as string
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 mb-1">
            Test Date
          </div>
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {row?.exam?.start_time ? format(new Date(row.exam.start_time), 'MMM dd, yyyy') : '-'}
            </span>
          </div>
        </div>

        {/* Created By Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex flex-col shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Created By
          </div>
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {row?.exam?.user?.name}{' '}
              {row?.exam?.user?.deleted_at ? <span className="text-red-500"> (Deleted)</span> : ''}
            </span>
          </div>

          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 mb-1">
            Created At
          </div>
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {row?.exam?.created_at
                ? dayjs(row?.exam?.created_at).format('DD/MM/YYYY h:mm A')
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Technology Scores */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-600">
        <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 flex items-center text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          Technology Breakdown
        </h4>

        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
          {/* Simple Header Row */}
          <div className="grid grid-cols-12 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 p-2">
            <div className="col-span-5 pl-2">Technology</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-3 text-center">Percentage</div>
            {/* <div className="col-span-2 text-right pr-2">Status</div> */}
          </div>

          {/* Overall Score Row */}
          <div className="grid grid-cols-12 items-center p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-5 font-medium text-gray-800 dark:text-gray-200 pl-2">
              Overall
            </div>
            <div className="col-span-2 text-sm text-center text-gray-600 dark:text-gray-300">
              {row?.score?.toFixed(1)} / {row?.total}
            </div>
            <div className="col-span-3">
              <div className="flex items-center justify-center">
                <span className="mr-2 font-medium">{row?.percentage?.toFixed(2)}%</span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      row?.is_passed ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(row?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 text-right pr-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  row?.is_passed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {row?.is_passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* Technology Scores Rows */}
          {row?.exam?.meta?.tech_score?.map((technology: ExamMetaTech) => (
            <div
              key={technology.technology_id}
              className="grid grid-cols-12 items-center p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="col-span-5 text-gray-700 dark:text-gray-300 pl-2 truncate">
                {getTechnology(technology.technology_id)}
              </div>
              <div className="col-span-2 text-sm text-center text-gray-600 dark:text-gray-400">
                {technology.score.toFixed(1)} / {technology.total}
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-center">
                  <span className="mr-2 font-medium">{technology.percentage?.toFixed(2)}%</span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        technology.percentage >= (row?.pass_criteria || 60)
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(technology.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              {/* <div className="col-span-2 text-right pr-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    technology.percentage >= (row?.pass_criteria || 60)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {technology.percentage >= (row?.pass_criteria || 60) ? 'PASS' : 'FAIL'}
                </span>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultExpandableRow;
