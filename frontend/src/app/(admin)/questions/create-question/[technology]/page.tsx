'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/form/button';
import QuestionCard from '@/components/questions/create-question-card';
import QuestionSidebar from '@/components/questions/create-question-sidebar';
import EmptyState from '@/components/common/EmptyCreateQuestionState';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Question } from '@/shared/types/app';
import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
import StatusWrapper from '@/components/common/status-wrapper';
import { FormField } from '@/components/common/form-field';
import useSWRMutation from 'swr/mutation';
import { isValidUUID } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/form/input';
import { isAxiosError } from 'axios';
// import { isValidObjectId } from '@/lib/utils';



async function create(url: string, { arg }: { arg: { name: string } }) {
  const response = await api.post(url, arg);
  return response;
}
async function update(url: string, { arg }: { arg: { name: string } }) {
  const response = await api.put(url, arg);
  return response;
}


const CreateQuestion: React.FC<{ params: { technology: string } }> = ({ params }) => {
  const [technologyId, setTechnologyId] = useState<string>(params.technology);

  const [questions, setQuestions] = useState<Question[]>([
    {
      technology_id: technologyId,
      question: '',
      options: ['', '', '', '', '', ''],
      correct_answer: [],
      time: '',
      difficulty_level: 'easy',
      type: 'mcq',
      meta: {},
    },
  ]);
  // const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [isValidTechnology, setValidTechnology] = useState<boolean>(isValidUUID(params.technology));
  const { data, isLoading, error,isValidating,mutate:questionMutate } = useSWR(
    isValidTechnology ? `/question/list?technology_id=${technologyId}` : null,
    api.get
  );



  const { trigger, isMutating } = useSWRMutation(`/technology/create`, create);
  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(
    `/technology/${technologyId}`,
    update
  );

  const toastId = useRef<string | null>(null);
  const handleTechnologySave = async () => {

    if (!name) {
      if (!toastId.current) {
        toastId.current = toast.error("Please enter technology name");
      }
      setTimeout(() => {
        toastId.current = null;
      }, 2000)
      return;
    }
    if (isValidTechnology) {
      try {
        const response = await updateTrigger({ name });
        toast.success(response.message || "Technology saved successfully!");
        mutate((key: string) => typeof key === 'string' && key.startsWith('/technology/list'));
      } catch (error) {
        toast.error(isAxiosError(error) ? error.response?.data?.message || "Failed to save technology." : "Failed to save technology.");
      }
    } else {
      try {
        const response = await trigger({ name });
        toast.success(response.message || "Technology created successfully!");
        window.history.replaceState(null, '', `/questions/create-question/${response.data.id}`);
        setTechnologyId(response.data.id);
        setValidTechnology(true);
        mutate((key: string) => typeof key === 'string' && key.startsWith('/technology/list'));
      } catch (error) {
        toast.error(isAxiosError(error) ? error.response?.data?.message || "Failed to create technology." : "Failed to create technology.");
      }
    }
  }
  useEffect(() => {
    setName(data?.data?.technology?.name || '');
    if (data?.data?.list?.length) {
      setQuestions(data?.data?.list);
      if (selectedQuestion > data?.data?.list.length) {
        setSelectedQuestion(data?.data?.list.length - 1);
      }
    }
  }, [data]);

  // const handleSave = () => {
  //   console.log(questions, "questions");
  //   toast.success("Questions saved successfully!");
  // };

  const handleReset = () => {
    setQuestions((prv) => {
      return prv.map((q, index) => {
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
    updatedQuestions[index].options = ['', '', '', '', '', ''];
    updatedQuestions[index].correct_answer = [];
    updatedQuestions[index].meta = {};
    if (value === 'code_snippet' || value === 'code_editor') {

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
      technology_id: technologyId,
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
    router.push('/questions');
  };

  return (
    // Main container
    <StatusWrapper className="p-6 dark:bg-gray-900 h-screen" loading={isLoading || isValidating} reset={questionMutate} error={error}>
      <Dialog open={!isValidTechnology} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Technology Name"
              className="border-gray-300"
              onChange={(e) => { setName(e.target.value) }}
              value={name}
            />
            <Button
              className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
              onClick={handleTechnologySave}
              disabled={isMutating || updating}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {isValidTechnology && <>
        <div className="flex justify-start items-center mb-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>{' '}
          <div className="text-2xl font-bold text-gray-900 dark:text-white w-full flex items-end gap-2">
            <div className='flex-grow'>
              <FormField
                id="name"
                placeholder='Enter Technology Name'
                className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300 w-full'
                value={name}
                maxLength={50}
                onChange={(e) => { setName(e.target.value) }}
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={handleTechnologySave}
              disabled={isMutating || updating}
            >Save</Button>
          </div>
        </div>

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
                      technology_id: technologyId,
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
                questions[selectedQuestion] && <QuestionCard
                  question={questions[selectedQuestion]}
                  selectedQuestion={selectedQuestion}
                  questions={questions}
                  handleQuestionTypeChange={handleQuestionTypeChange}
                  handleDeleteQuestion={handleDeleteQuestion}
                  setQuestions={setQuestions}
                  handleReset={handleReset}
                  technologyId={technologyId}
                />
                // ))
              )}
            </div>
          </div>
          {/* {!isValidTechnology && <div className="absolute h-full w-full backdrop-blur-sm"></div>} */}

        </div>
      </>}

    </StatusWrapper>
  );
};

export default CreateQuestion;
