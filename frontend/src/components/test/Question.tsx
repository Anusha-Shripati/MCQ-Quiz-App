import { Answer, IExamQuestion, QuestionType } from '@/types/exam.types';
import { Radio } from '../ui/form/radio';
import { RadioGroup } from '../ui/form/radio';
import React from 'react'
import { VideoRecorderQuestion } from './VideoRecorderQuestion';
import { Textarea } from '../ui/form/textarea';
import EditorPage from '@/components/editor/page';
import { Checkbox } from '../ui/form/checkbox';

interface QuestionProps {
    question: IExamQuestion;
    answers: Record<string, { question: IExamQuestion; answer: Answer }>;
    handleAnswerChange: (question: IExamQuestion, answer: Answer) => void;
    handleStopRecording: (blob: Blob | null, url: string) => void;
    handleNextQuestion: () => void;
    isLoading:boolean
}


function Question({ question, answers, handleAnswerChange, handleStopRecording, handleNextQuestion,isLoading }: QuestionProps) {
    switch (question.question.type) {
        case QuestionType.MCQ:
            return (
                <RadioGroup
                    value={answers[question.question_id]?.answer as string}
                    onValueChange={(value) => handleAnswerChange(question, value)}
                    className="space-y-4"
                >
                    {question.question.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                            <Radio value={`${idx}`} id={`option-${question.question_id}-${idx}`} />
                            <label
                                htmlFor={`option-${question.question_id}-${idx}`}
                                className="text-lg text-gray-800 cursor-pointer"
                            >
                                {option}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
            );
        case QuestionType.VIDEO:
            return (
                <VideoRecorderQuestion isLoading={isLoading} question={question} answers={answers} onRecordingStop={(blob, url) => handleStopRecording(blob, url)} onRecordingComplete={() => handleNextQuestion()} />
            );
        case QuestionType.MULTIPLE_SELECT:
            return (
                <div className="space-y-4">
                    {question.question.options?.map((option, idx) => {
                        const currentAnswers = answers[question.question_id]
                            ? (answers[question.question_id]?.answer as (string | number)[])
                            : [];

                        return (
                            <div key={idx} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`option-${question.question_id}-${idx}`}
                                    checked={currentAnswers.includes(idx.toString())}
                                    onCheckedChange={(checked) => {
                                        let newAnswers: (string | number)[];

                                        if (!checked) {
                                            newAnswers = currentAnswers.filter((a) => a !== idx.toString());
                                        } else {
                                            newAnswers = [...currentAnswers, idx.toString()];
                                        }
                                        handleAnswerChange(question, newAnswers);
                                    }}
                                />
                                <label
                                    htmlFor={`option-${question.question_id}-${idx}`}
                                    className="text-lg text-gray-800 cursor-pointer"
                                >
                                    {option}
                                </label>
                            </div>
                        );
                    })}
                </div>
            );

        case QuestionType.TEXT:
            return (
                <Textarea
                    value={(answers[question.question_id]?.answer as string) || ''}
                    onChange={(e) => handleAnswerChange(question, e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[120px] text-lg"
                />
            );

        case QuestionType.CODE_SNIPPET:
            return (
                <div className="space-y-2">
                    <Textarea
                        value={(answers[question.question_id]?.answer as string) || ''}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        placeholder="Write your code here..."
                        className="min-h-[200px] font-mono text-black text-base"
                    />
                    <div className="text-sm text-gray-500">
                        Tip: Use proper indentation and comments where necessary
                    </div>
                </div>
            );

        case QuestionType.CODE_EDITOR:
            return (
                <div className="space-y-2">
                    <EditorPage
                        onChange={(value) => handleAnswerChange(question, value)}
                        value={(answers[question.question_id]?.answer as string) || ''}
                    />
                    <div className="text-sm text-gray-500">
                        Tip: Use proper indentation and comments where necessary
                    </div>
                </div>
            );

        default:
            return <div className="text-red-500">Unsupported question type</div>;
    }
}
export default Question;