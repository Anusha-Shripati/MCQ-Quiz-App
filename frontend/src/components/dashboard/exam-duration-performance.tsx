'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { dashboardEndpoint } from '@/lib/endpoint';
import useSWR from 'swr';
import StatusWrapper from '../common/status-wrapper';

interface DurationPerformanceData {
  durationRange: string;
  avgDuration: number;
  avgPercentage: number;
  passRate: number;
  totalExams: number;
  passCount: number;
  failCount: number;
}

export default function ExamDurationPerformance() {
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    dashboardEndpoint.EXAM_DURATION_PERFORMANCE,
    api.get
  );

  const performanceData: DurationPerformanceData[] = data?.data || [];

  // const getPerformanceColor = (percentage: number) => {
  //   if (percentage >= 75) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  //   if (percentage >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  //   if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  //   return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  // };

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 75) return 'text-green-600 dark:text-green-400';
    if (passRate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="shadow-lg col-span-12 md:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">Duration vs Performance</CardTitle>
        <CardDescription className="text-sm">
          How exam duration affects candidate performance
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[350px] overflow-y-auto hide-scroller mb-3">
        <StatusWrapper
          loading={isLoading || isValidating}
          reset={mutate}
          error={error}
          className=""
        >
          {performanceData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No duration data available
            </div>
          ) : (
            <div className="space-y-4">
              {performanceData.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{item.durationRange}</h3>
                      <p className="text-xs text-muted-foreground">
                        Avg: {item.avgDuration} min • {item.totalExams} exams
                      </p>
                    </div>
                    {/* <div className="text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(
                          item.avgPercentage
                        )}`}
                      >
                        {item.avgPercentage.toFixed(1)}%
                      </div>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Pass Rate</p>
                      <p className={`text-lg font-bold ${getPassRateColor(item.passRate)}`}>
                        {item.passRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Pass/Fail</p>
                      <p className="text-sm font-semibold">
                        <span className="text-green-600 dark:text-green-400">{item.passCount}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-red-600 dark:text-red-400">{item.failCount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${item.avgPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </StatusWrapper>
      </CardContent>
    </Card>
  );
}
