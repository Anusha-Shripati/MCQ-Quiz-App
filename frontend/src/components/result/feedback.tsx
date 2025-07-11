import { api } from '@/lib/api';
import { resultEndpoint } from '@/lib/endpoint';
import React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackData {
  experience_rating: number;
  question_clarity: string;
  difficulty: string;
  technical_issues: string;
  comments: string;
}

const Feedback = ({ resultId }: { resultId: string }) => {
  const { data, error, isLoading } = useSWR<{ data: FeedbackData }>(
    `${resultEndpoint.GET_FEEDBACK}/${resultId}`,
    api.get
  );
  
  const feedback = data?.data;
  
  if (isLoading) {
    return <FeedbackSkeleton />;
  }
  
  if (error) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-6 text-destructive">
            <AlertCircle className="mr-2" />
            <span>Failed to load feedback data</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!feedback) {
    return (
      <Card className="w-full shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            No feedback available for this exam
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Exam Feedback</CardTitle>
        <CardDescription>Candidate&apos;s feedback on their exam experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Experience Rating */}
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Overall Experience Rating</h3>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-6 h-6 ${
                    star <= feedback.experience_rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {feedback.experience_rating}/5
              </span>
            </div>
          </div>

          {/* Question Clarity */}
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Question Clarity</h3>
            <div className="px-4 py-2 bg-secondary rounded-md text-secondary-foreground">
              {feedback.question_clarity}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Exam Difficulty</h3>
            <div className="px-4 py-2 bg-secondary rounded-md text-secondary-foreground">
              {feedback.difficulty}
            </div>
          </div>

          {/* Technical Issues */}
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Technical Issues</h3>
            <div className="flex items-center">
              {feedback.technical_issues === "Yes" ? (
                <div className="flex items-center text-destructive">
                  <XCircle className="w-5 h-5 mr-2" />
                  <span>Yes, encountered issues</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>No issues reported</span>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {feedback.comments && (
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Additional Comments</h3>
              <div className="px-4 py-3 bg-muted rounded-md text-muted-foreground">
                <p className="italic">&ldquo;{feedback.comments}&rdquo;</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const FeedbackSkeleton = () => (
  <Card className="w-full shadow-md">
    <CardHeader>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-full mr-1" />
            ))}
          </div>
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Feedback;