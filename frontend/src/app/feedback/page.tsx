'use client';

import React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/form/button';
import { Textarea } from '@/components/ui/form/textarea';
import { RadioGroup, Radio } from '@/components/ui/form/radio';
import { toast } from 'react-hot-toast';
import { Label } from '@/components/ui/form/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { StarIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { useExamStore } from '@/store/examStore';
import { examEndpoint } from '@/lib/endpoint';
import {  Candidate_feedback } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Form schema
const feedbackFormSchema = z.object({
  experience_rating: z.number().min(1).max(5),
  question_clarity: z.string().min(1),
  difficulty: z.string().min(1),
  technical_issues: z.string().min(1),
  comments: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
// Function to submit feedback


// Star Rating Component
const StarRating = ({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          {star <= rating ? (
            <StarIcon className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          ) : (
            <StarIcon className="w-8 h-8 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
};

export default function FeedbackPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      experience_rating: 0,
      question_clarity: '',
      difficulty: '',
      technical_issues: '',
      comments: '',
    },
  });

  const { exam, accessCode } = useExamStore();
  const router = useRouter();
  const examId = exam?.candidate?.exam_id || '';
  console.log('Exam ID:', examId);
  const [isIssue, setIsIssue] = React.useState(false);
  const { trigger } = useSWRMutation(
    `${examEndpoint.CANDIDATE_EXAM}/${examId}/submit-feedback`,
    (url: string, { arg }: { arg: FeedbackFormValues }) => Candidate_feedback.post(url, arg, accessCode)
  );
  const onSubmit = async (data: FeedbackFormValues) => {
    console.log('Feedback form data:', data);
    try {
      const res = await trigger(data);
      console.log('Feedback submitted:', res);
      toast.success('Feedback submitted successfully!');
      router.push('/thank-you');
      reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Feedback Form</CardTitle>
          <CardDescription>Please share your experience with our MCQ quiz system</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Overall Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience_rating">
                How would you rate your overall experience? <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <Controller
                  name="experience_rating"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <StarRating
                      rating={field.value}
                      onRatingChange={(rating) => field.onChange(rating)}
                    />
                  )}
                />
                {errors.experience_rating && (
                  <p className="text-red-500 text-sm mt-1">Please select a rating</p>
                )}
              </div>
            </div>

            {/* Question Clarity */}
            <div className="space-y-2">
              <Label htmlFor="question_clarity">
                Were the questions clear and understandable? <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="question_clarity"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="question_clarity">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Very Clear">Very Clear</SelectItem>
                      <SelectItem value="Clear">Clear</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Unclear">Unclear</SelectItem>
                      <SelectItem value="Very Unclear">Very Unclear</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.question_clarity && (
                <p className="text-red-500 text-sm mt-1">Please select an option</p>
              )}
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">
                How did you find the difficulty of the exam? <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <Radio id="too-easy" value="Too Easy" />
                      <label htmlFor="too-easy">Too Easy</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio id="easy" value="Easy" />
                      <label htmlFor="easy">Easy</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio id="moderate" value="Moderate" />
                      <label htmlFor="moderate">Moderate</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio id="hard" value="Hard" />
                      <label htmlFor="hard">Hard</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio id="too-hard" value="Too Hard" />
                      <label htmlFor="too-hard">Too Hard</label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.difficulty && (
                <p className="text-red-500 text-sm mt-1">Please select an option</p>
              )}
            </div>

            {/* Technical Issues */}
            <div className="space-y-2">
              <Label htmlFor="technical_issues">
                Did you face any technical problems? <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="technical_issues"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <Radio id="yes-issues" value="Yes" onClick={() => setIsIssue(true)} />
                      <label htmlFor="yes-issues">Yes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio id="no-issues" value="No" onClick={() => setIsIssue(false)} />
                      <label htmlFor="no-issues">No</label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.technical_issues && (
                <p className="text-red-500 text-sm mt-1">Please select an option</p>
              )}
            </div>

            {/* Technical Issues Description - Conditional Field */}
            {isIssue && (
              <div className="space-y-2">
                <Label htmlFor="comments">If you faced any issues, Please let us know:</Label>
                <Textarea
                  id="comments"
                  placeholder="Share your thoughts or suggestions here..."
                  className="min-h-[100px]"
                  {...register('comments')}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
