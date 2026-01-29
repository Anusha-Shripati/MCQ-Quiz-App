'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { dashboardEndpoint } from '@/lib/endpoint';
import useSWR from 'swr';
import StatusWrapper from '../common/status-wrapper';
import { Badge } from '@/components/ui/badge';

interface TopAssessment {
  assessment_id: string;
  name: string;
  technologies: string[];
  count: number;
}

export default function TopAssessments() {
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    dashboardEndpoint.TOP_ASSESSMENTS,
    api.get
  );

  const assessments: TopAssessment[] = data?.data || [];

  const getRankStyle = (index: number) => {
    const styles = [
      { bg: 'bg-yellow-500 dark:bg-yellow-600', text: 'text-white' },
      { bg: 'bg-gray-400 dark:bg-gray-500', text: 'text-white' },
      { bg: 'bg-orange-500 dark:bg-orange-600', text: 'text-white' },
      { bg: 'bg-blue-500 dark:bg-blue-600', text: 'text-white' },
      { bg: 'bg-purple-500 dark:bg-purple-600', text: 'text-white' },
    ];
    return styles[index] || { bg: 'bg-gray-500', text: 'text-white' };
  };

  return (
    <Card className="shadow-lg col-span-12 md:col-span-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">Top Assigned Assessments</CardTitle>
        <CardDescription className="text-sm font-bold">
          Most frequently assigned to candidates
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto hide-scroller mb-3">
        <StatusWrapper
          loading={isLoading || isValidating}
          reset={mutate}
          error={error}
          className="max-h-[300px]"
        >
          <div className="space-y-3">
            {assessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No assessments assigned yet
              </div>
            ) : (
              assessments.map((assessment, index) => {
                const rankStyle = getRankStyle(index);
                return (
                  <div
                    key={assessment.assessment_id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/30 transition-all duration-200"
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full ${rankStyle.bg} ${rankStyle.text} flex items-center justify-center font-bold text-base shadow-sm`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-sm truncate mb-1.5">{assessment.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {assessment.technologies.slice(0, 3).map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {assessment.technologies.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            +{assessment.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xl font-bold text-foreground">{assessment.count}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {assessment.count === 1 ? 'candidate' : 'candidates'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </StatusWrapper>
      </CardContent>
    </Card>
  );
}
