'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/form/button';
import QuestionCard from '@/components/questions/create-question-card';
import QuestionSidebar from '@/components/questions/create-question-sidebar';
import EmptyState from '@/components/common/EmptyCreateQuestionState';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Question } from '@/shared/types/app';
import useSWR from 'swr';
import { api } from '@/lib/api';
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
import StatusWrapper from '@/components/common/status-wrapper';
const CreateQuestion: React.FC<{ params: { technology: string } }> = ({ params }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  // const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

  const { data, isLoading, error } = useSWR(
    `/question/list?technology_id=${params.technology}`,
    api.get
  );

  useEffect(() => {
    if (data?.data?.list?.length) {
      setQuestions(data?.data?.list);
      if (selectedQuestion > data?.data?.list.length) {
        setSelectedQuestion(data?.data?.list.length - 1);
      }
    }

    console.log(data?.data?.list, 'data?.data?.list');
    console.log(questions, 'questions');
    console.log(questions.length, 'questions.length');

    if (!data?.data?.list?.length) {
      setQuestions([
        {
          technology_id: params.technology,
          question: '',
          options: ['', '', '', '', '', ''],
          correct_answer: [],
          time: '',
          difficulty_level: 'easy',
          type: 'mcq',
          meta: {},
        },
      ]);
    }
  }, [data]);

  // const handleSave = () => {
  //   console.log(questions, "questions");
  //   toast.success("Questions saved successfully!");
  // };

  const handleReset = () => {
    setQuestions((prv) => {
      return prv.map((q, index) => {
        console.log(q, 'q');
        if (index != selectedQuestion) return q;
        return {
          ...q,
          question: '',
          options: ['', '', '', '', '', ''],
          correct_answer: [],
          time: '',
          difficulty_level: 'easy',
          type: 'mcq',
          meta: {},
        };
      });
    });
    toast.success('Questions Reset successfully!');
  };

  const handleDeleteQuestion = async (question: Question, index: number) => {
    try {
      if (question.id) {
        await api.delete(`/question/${question.id}`);
      }
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
      console.log(
        selectedQuestion,
        updatedQuestions,
        updatedQuestions.length,
        'selectedQuestion,updatedQuestions.length'
      );
      console.log(questions, 'questions');

      if (selectedQuestion >= updatedQuestions.length && updatedQuestions.length) {
        setSelectedQuestion(updatedQuestions.length - 1);
      } else if (updatedQuestions.length == 0) {
        setSelectedQuestion(0);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleQuestionTypeChange = (value: Question['type'], index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = value;

    if (value === 'mcq' || value === 'multiple_select') {
      updatedQuestions[index].options = ['', '', '', '', '', '']; // 4 compulsory + 2 optional
      updatedQuestions[index].correct_answer = []; // Reset correct options
    } else if (value === 'text') {
      updatedQuestions[index].correct_answer = [];
    } else if (value === 'code_snippet') {
      updatedQuestions[index].correct_answer = [];
      if (updatedQuestions[index]?.meta?.code === undefined) {
        updatedQuestions[index].meta = { code: '' };
      }
    }

    setQuestions(updatedQuestions);
  };

  // const handleCorrectOptionChange = (optionIndex: number, index: number) => {
  //   const updatedQuestions = [...questions];
  //   const question = updatedQuestions[index];

  //   // Replace optional chaining with type assertion
  //   if (!question.correctOptions) {
  //     question.correctOptions = [];
  //   }

  //   if (question.type === "radio-select") {
  //     question.correctOptions = [optionIndex];
  //   } else if (question.type === "multiple-choice") {
  //     const currentOptions = question.correctOptions;
  //     if (currentOptions.includes(optionIndex as number)) {
  //       question.correctOptions = (currentOptions as number[]).filter(
  //         (i: number) => i !== optionIndex
  //       );
  //     } else {
  //       question.correctOptions = [...currentOptions, optionIndex];
  //     }
  //   }

  //   setQuestions(updatedQuestions);
  // };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      technology_id: params.technology,
      type: 'mcq',
      question: '',
      options: ['', '', '', '', '', ''],
      correct_answer: [],
      time: '',
      difficulty_level: 'easy',
      meta: {},
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(questions.length);
  };

  const handleBack = () => {
    console.log('Back button clicked');
    router.push('/questions');
  };

  useEffect(() => {
    if (questions.length) {
      // setShowSidebar(true)
    }
  }, [questions]);

  return (
    // Main container
    <StatusWrapper className="p-6 dark:bg-gray-900 " loading={isLoading} error={error}>
      {/* Header */}
      <div className="flex justify-start items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>{' '}
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {data?.data?.technology?.name}
        </div>
        {/* <Button onClick={handleSave}>Save</Button> */}
      </div>

      {/* Remaining body */}
      <div className="flex gap-6">
        {/* Sidebar for questions no. list */}
        {questions.length ? (
          <QuestionSidebar
            questions={questions}
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
            handleAddQuestion={handleAddQuestion}
          />
        ) : (
          ''
        )}

        {/* Questions list with data for real questions which can be edited */}
        <div className="flex-1 h-[calc(100vh-8rem)] ">
          <div className="flex-1">
            {questions?.length === 0 || !questions ? (
              <EmptyState
                title="No Questions Added"
                description="Get started by adding a new question."
                actionText="Add Question"
                onAction={() => {
                  // Example: Add a new question
                  const newQuestion: Question = {
                    technology_id: params.technology,
                    question: '',
                    options: ['', '', '', '', '', ''],
                    correct_answer: [],
                    time: '',
                    difficulty_level: 'easy',
                    type: 'mcq',
                    meta: {},
                  };
                  setQuestions([newQuestion]);
                }}
              />
            ) : (
              // questions.map((q, index) => (
              <QuestionCard
                question={questions[selectedQuestion]}
                selectedQuestion={selectedQuestion}
                questions={questions}
                handleQuestionTypeChange={handleQuestionTypeChange}
                handleDeleteQuestion={handleDeleteQuestion}
                setQuestions={setQuestions}
                handleReset={handleReset}
                technologyId={params.technology}
              />
              // ))
            )}
          </div>
        </div>
      </div>
    </StatusWrapper>
  );
};

export default CreateQuestion;
