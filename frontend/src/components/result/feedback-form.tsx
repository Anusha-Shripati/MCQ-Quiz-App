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
import { Candidate_feedback } from '@/lib/api';
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
                    className={`focus:outline-none transition-transform duration-150 rounded-full p-1.5 hover:scale-110 ${star <= rating ? 'bg-yellow-100' : 'bg-gray-100'}`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                    {star <= rating ? (
                        <StarIcon className="w-9 h-9 text-yellow-500 fill-yellow-500 drop-shadow" />
                    ) : (
                        <StarIcon className="w-9 h-9 text-gray-300" />
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
    const [isIssue, setIsIssue] = React.useState(false);
    const { trigger } = useSWRMutation(
        `${examEndpoint.CANDIDATE_EXAM}/${examId}/submit-feedback`,
        (url: string, { arg }: { arg: FeedbackFormValues }) => Candidate_feedback.post(url, arg, accessCode)
    );
    const onSubmit = async (data: FeedbackFormValues) => {
        try {
            await trigger(data);
            toast.success('Feedback submitted successfully!');
            router.push('/thank-you');
            reset();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-2">
            <Card className="max-w-3xl w-full mx-auto shadow-2xl rounded-2xl border-0 bg-white/90">
                <CardHeader className="pb-4 border-b border-gray-200">
                    <CardTitle className="text-3xl font-extrabold text-indigo-700">Feedback Form</CardTitle>
                    <CardDescription className="text-gray-500 mt-1">Please share your experience with our MCQ quiz system</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-8 pt-8 pb-4 px-6">
                        {/* Overall Experience */}
                        <div className="space-y-2">
                            <Label htmlFor="experience_rating" className="text-lg font-semibold text-gray-700">
                                How would you rate your overall experience? <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-2">
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

                        {/* Question Clarity - Forced Light Mode */}
                        <div className="!bg-white !text-black rounded-lg" style={{ colorScheme: 'light' }}>
                            <Label htmlFor="question_clarity" className="text-lg font-semibold !text-gray-700">
                                Were the questions clear and understandable? <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="question_clarity"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger
                                            id="question_clarity"
                                            className="!text-black !bg-white h-12 focus:ring-2 focus:ring-indigo-400"
                                        >
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent className="!bg-white !text-black rounded-lg shadow-lg">
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
                            <Label htmlFor="difficulty" className="text-lg font-semibold text-gray-700">
                                How did you find the difficulty of the exam? <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="difficulty"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-2 mt-1"
                                    >
                                        <div className="flex items-center space-x-3 hover:bg-indigo-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="too-easy" value="Too Easy" className="accent-indigo-500" />
                                            <label htmlFor="too-easy" className="text-gray-700">Too Easy</label>
                                        </div>
                                        <div className="flex items-center space-x-3 hover:bg-indigo-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="easy" value="Easy" className="accent-indigo-500" />
                                            <label htmlFor="easy" className="text-gray-700">Easy</label>
                                        </div>
                                        <div className="flex items-center space-x-3 hover:bg-indigo-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="moderate" value="Moderate" className="accent-indigo-500" />
                                            <label htmlFor="moderate" className="text-gray-700">Moderate</label>
                                        </div>
                                        <div className="flex items-center space-x-3 hover:bg-indigo-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="hard" value="Hard" className="accent-indigo-500" />
                                            <label htmlFor="hard" className="text-gray-700">Hard</label>
                                        </div>
                                        <div className="flex items-center space-x-3 hover:bg-indigo-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="too-hard" value="Too Hard" className="accent-indigo-500" />
                                            <label htmlFor="too-hard" className="text-gray-700">Too Hard</label>
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
                            <Label htmlFor="technical_issues" className="text-lg font-semibold text-gray-700">
                                Did you face any technical problems? <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="technical_issues"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-8 mt-1"
                                    >
                                        <div className="flex items-center space-x-2 hover:bg-red-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="yes-issues" value="Yes" onClick={() => setIsIssue(true)} className="accent-red-500" />
                                            <label htmlFor="yes-issues" className="text-gray-700">Yes</label>
                                        </div>
                                        <div className="flex items-center space-x-2 hover:bg-green-50 rounded-lg px-2 py-1 transition">
                                            <Radio id="no-issues" value="No" onClick={() => setIsIssue(false)} className="accent-green-500" />
                                            <label htmlFor="no-issues" className="text-gray-700">No</label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.technical_issues && (
                                <p className="text-red-500 text-sm mt-1">Please select an option</p>
                            )}
                        </div>

                        {/* Technical Issues Description - Conditional Field */}
                        <div className={`transition-all duration-300 ${isIssue ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                            {isIssue && (
                                <div className="space-y-2 bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                                    <Label htmlFor="comments" className="text-gray-700">If you faced any issues, Please let us know:</Label>
                                    <Textarea
                                        id="comments"
                                        placeholder="Share your thoughts or suggestions here..."
                                        className="min-h-[100px] border-gray-300 focus:ring-2 focus:ring-red-300 bg-white/80 text-black"
                                        {...register('comments')}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="px-6 pb-8 pt-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-lg font-semibold shadow-lg rounded-xl transition-all duration-200 flex items-center justify-center">
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : 'Submit Feedback'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
