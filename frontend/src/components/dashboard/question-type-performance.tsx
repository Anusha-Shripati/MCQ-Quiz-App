'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { dashboardEndpoint } from '@/lib/endpoint';
import useSWR from 'swr';
import StatusWrapper from '../common/status-wrapper';
import ReusableTable from '../common/reusable-table';

interface QuestionTypeData {
  type: string;
  avgScore: number;
  totalAttempts: number;
  questionsCount: number;
}

export default function QuestionTypePerformance() {
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    dashboardEndpoint.QUESTION_TYPE_PERFORMANCE,
    api.get
  );

  const performanceData: QuestionTypeData[] = data?.data || [];

  const columns = [
    {
      key: 'type',
      header: 'Question Type',
      render: (row: QuestionTypeData) => (
        <span className="font-medium capitalize">{row.type.replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'avgScore',
      header: 'Avg Score',
      render: (row: QuestionTypeData) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 dark:bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                row.avgScore >= 75
                  ? 'bg-green-500'
                  : row.avgScore >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${row.avgScore}%` }}
            />
          </div>
          <span className="font-semibold text-sm">{row.avgScore.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: 'questionsCount',
      header: 'Questions',
      render: (row: QuestionTypeData) => (
        <span className="text-sm">{row.questionsCount}</span>
      ),
    },
    {
      key: 'totalAttempts',
      header: 'Total Attempts',
      render: (row: QuestionTypeData) => (
        <span className="text-sm font-medium">{row.totalAttempts}</span>
      ),
    },
  ];

  return (
    <Card className="shadow-lg col-span-12 md:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Question Type Performance
        </CardTitle>
        <CardDescription className="text-sm">
          Average score by question type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatusWrapper
          loading={isLoading || isValidating}
          reset={mutate}
          error={error}
          className="min-h-[300px]"
        >
          {performanceData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No performance data available
            </div>
          ) : (
            <ReusableTable
              columns={columns}
              rows={performanceData}
              title="Question Type Performance"
              rowKey="type"
              className="max-h-[400px]"
            />
          )}
        </StatusWrapper>
      </CardContent>
    </Card>
  );
}
