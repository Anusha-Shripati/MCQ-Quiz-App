"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import QuestionCard from '@/components/questions/create-question-card';
import { CREATE_QUESTIONS_STATIC_LIST } from '@/shared/constants/data';
import QuestionSidebar from '@/components/questions/create-question-sidebar';
import EmptyState from '@/components/common/EmptyCreateQuestionState';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Question } from "@/shared/types/app";


const CreateQuestion: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>(CREATE_QUESTIONS_STATIC_LIST);
    const router = useRouter();
    const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

    const handleSave = () => {
        toast.success('Questions saved successfully!');
    };

    const handleDeleteQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        if (selectedQuestion >= updatedQuestions.length) {
            setSelectedQuestion(updatedQuestions.length - 1);
        }
    };

    const handleQuestionTypeChange = (value: Question['type'], index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].type = value;

        // Reset answer/options based on the new type
        if (value === 'multiple-choice' || value === 'radio-select') {
            updatedQuestions[index].options = ['', '', '', '', '', '']; // 4 compulsory + 2 optional
            updatedQuestions[index].correctOptions = []; // Reset correct options
            delete updatedQuestions[index].answer; // Remove answer field if it exists
            delete updatedQuestions[index].code; // Remove code field if it exists
        } else if (value === 'fill-in-the-blanks') {
            updatedQuestions[index].answer = '';
            delete updatedQuestions[index].options; // Remove options field if it exists
            delete updatedQuestions[index].correctOptions; // Remove correct options field if it exists
            delete updatedQuestions[index].code; // Remove code field if it exists
        } else if (value === 'code-snippet') {
            updatedQuestions[index].code = '';
            delete updatedQuestions[index].options; // Remove options field if it exists
            delete updatedQuestions[index].correctOptions; // Remove correct options field if it exists
            delete updatedQuestions[index].answer; // Remove answer field if it exists
        }

        setQuestions(updatedQuestions);
    };

    const handleCorrectOptionChange = (optionIndex: number, index: number) => {
        const updatedQuestions = [...questions];
        const question = updatedQuestions[index];

        // Replace optional chaining with type assertion
        if (!question.correctOptions) {
            question.correctOptions = [];
        }

        if (question.type === 'radio-select') {
            question.correctOptions = [optionIndex];
        } else if (question.type === 'multiple-choice') {
            const currentOptions = question.correctOptions;
            if (currentOptions.includes(optionIndex as number)) {
                question.correctOptions = (currentOptions as number[]).filter((i: number) => i !== optionIndex);
            } else {
                question.correctOptions = [...currentOptions, optionIndex];
            }
        }

        setQuestions(updatedQuestions);
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: questions.length + 1,
            type: 'multiple-choice',
            difficulty: 'easy',
            question: '',
            options: ['', '', '', '', '', ''],
            correctOptions: [],
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestion(questions.length);
    };

    return (
        // Main container
        <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
            {/* Header */}
            <div className="flex justify-start items-center mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button> <div className="text-2xl font-bold text-gray-900 dark:text-white">React.js</div>
                {/* <Button onClick={handleSave}>Save</Button> */}
            </div>

            {/* Remaining body */}
            <div className="flex gap-6">
                {/* Sidebar for questions no. list */}
                <QuestionSidebar
                    questions={questions}
                    selectedQuestion={selectedQuestion}
                    setSelectedQuestion={setSelectedQuestion}
                    handleDeleteQuestion={handleDeleteQuestion}
                    handleAddQuestion={handleAddQuestion}
                />

                {/* Questions list with data for real questions which can be edited */}
                <div className="flex-1 h-[calc(100vh-8rem)]">
                    <div className="flex-1">
                        {questions.length === 0 ? ( // Check if there are no questions
                            <EmptyState
                                title="No Questions Added"
                                description="Get started by adding a new question."
                                actionText="Add Question"
                                onAction={() => {
                                    // Example: Add a new question
                                    const newQuestion: Question = {
                                        id: 1,
                                        type: 'multiple-choice',
                                        difficulty: 'easy',
                                        question: '',
                                        options: ['', '', '', '', '', ''],
                                        correctOptions: [],
                                    };
                                    setQuestions([newQuestion]);
                                }}
                            />
                        ) : (
                            questions.map((q, index) => (
                                <QuestionCard
                                    key={q.id}
                                    question={q}
                                    index={index}
                                    selectedQuestion={selectedQuestion}
                                    questions={questions}
                                    handleQuestionTypeChange={handleQuestionTypeChange}
                                    handleCorrectOptionChange={handleCorrectOptionChange}
                                    handleDeleteQuestion={handleDeleteQuestion}
                                    setQuestions={setQuestions}
                                />
                            ))
                        )}
                    </div>
                    {/* Add Question Button */}
                    {questions.length !== 0 && <div className="mt-6 flex justify-end gap-4">
                        <Button onClick={handleSave}>Save</Button>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default CreateQuestion;