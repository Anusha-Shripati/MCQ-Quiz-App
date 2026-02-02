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
import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
import StatusWrapper from '@/components/common/status-wrapper';
import { FormField } from '@/components/common/form-field';
import useSWRMutation from 'swr/mutation';
import { showSingleToast } from '@/lib/utils';
import { isAxiosError } from 'axios';
import { technologyEndpoint } from '@/lib/endpoint';
import { useQuestionPreferencesStore } from '@/store/questionPreferencesStore';

// import { isValidObjectId } from '@/lib/utils';

// async function create(url: string, { arg }: { arg: { name: string; questions: Question[] } }) {
//   const response = await api.post(url, arg);
//   return response;
// }

async function update(url: string, { arg }: { arg: { name: string; questions: Question[] } }) {
  const response = await api.put(url, arg);
  return response;
}

const CreateQuestion: React.FC<{ params: { technology: string } }> = ({ params }) => {
  const { lastSelectedType, lastSelectedDifficulty, setLastSelectedType } = useQuestionPreferencesStore();
  const { data: technologyData } = useSWR(`${technologyEndpoint.LIST}`, api.get);
  const [technologyId, setTechnologyId] = useState<string>(params.technology);
  const [questions, setQuestions] = useState<Question[]>([
    {
      technology_id: technologyId,
      question: '',
      options: ['', '', '', '', '', ''],
      correct_answer: [],
      time: '',
      difficulty_level: lastSelectedDifficulty,
      type: lastSelectedType,
      meta: {},
    },
  ]);

  // Add state to track validation errors
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});
  // const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [name, setName] = useState<string>('');
  // const [isValidTechnology, setIsValidTechnology]: [
  //   boolean,
  //   React.Dispatch<React.SetStateAction<boolean>>,
  // ] = useState<boolean>(isValidUUID(params.technology));
  const [technology, setTechnology] = useState<string>('');

  // const {
  //   data,
  //   isLoading,
  //   error,
  //   isValidating,
  //   mutate: questionMutate,
  // } = useSWR(
  //   isValidTechnology ? `${questionEndpoint.LIST}?technology_id=${technologyId}` : null,
  //   api.get
  // );

  // const { trigger, isMutating } = useSWRMutation(`${technologyEndpoint.CREATE}`, create);

  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(
    `${technologyEndpoint.TECHNOLOGY_BY_ID}/${technologyId}`,
    update
  );

  useEffect(() => {
    setQuestions([
      {
        technology_id: technologyId,
        question: '',
        options: ['', '', '', '', '', ''],
        correct_answer: [],
        time: '',
        difficulty_level: lastSelectedDifficulty,
        type: lastSelectedType,
        meta: {},
      },
    ]);
    setSelectedQuestion(0);
  }, [technologyId]);

  // Add new useEffect to set the technology value when technologyId or technologyData changes
  useEffect(() => {
    if (technologyData?.data?.list && technologyId) {
      setTechnology(technologyId);
      setName(
        technologyData.data.list.find(
          (tech: { id: string; name: string }) => tech.id === technologyId
        )?.name || ''
      );
    }
  }, [technologyId, technologyData]);

  const handleReset = (type:'question' |'answer' | 'all') => {
    setQuestions((prv) => {
      return prv.map((q, index) => {
        if (index != selectedQuestion) return q;
        return {
          ...q,
          question: type == 'all' ||  type == 'question' ?'':q.question,
          options: type == 'all' ||  type == 'answer' ? ['', '', '', '', '', '']:q.options,
          correct_answer: type == 'all' ||  type == 'answer'? []:q.correct_answer,
          difficulty_level: type == 'all'?'easy':q.difficulty_level,
          type: type == 'all'?'mcq':q.type,
          meta: type == 'all' || type == 'answer'?{}:q.meta,
        };
      });
    });
    toast.success(type == 'answer' ? 'Answer Reset successfully!' : type == 'question' ? 'Question Reset successfully!' : 'All Reset successfully!');
  };

  const handleDeleteQuestion = async (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setValidationErrors((prv)=>{
      const temp = {...prv}
      delete temp[index]
      return temp
    })
    
    setSelectedQuestion(selectedQuestion == 0? 0:selectedQuestion-1)

  };

  const handleQuestionTypeChange = (value: Question['type'], index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = value;
    updatedQuestions[index].options = ['', '', '', '', '', ''];
    updatedQuestions[index].correct_answer = [];
    updatedQuestions[index].meta = {};

    if (value === 'code_snippet') {
      updatedQuestions[index].options = ['', '', '', '', '', ''];
      updatedQuestions[index].meta = { code: '' };
    } else if (value === 'code_editor') {
      updatedQuestions[index].options = [];
      if (updatedQuestions[index]?.meta?.code === undefined) {
        updatedQuestions[index].meta = { code: '' };
      }
    } else if (value === 'code_snippet_with_mcq') {
      updatedQuestions[index].options = ['', '', '', '', '', ''];
      updatedQuestions[index].meta = { code: '' };
      if (updatedQuestions[index]?.meta?.code === undefined) {
        updatedQuestions[index].meta = { code: '' };
      }
    }

    // Store the last selected type
    setLastSelectedType(value);

    // Reset validation errors for this question
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      technology_id: technologyId,
      type: lastSelectedType,
      question: '',
      options: ['', '', '', '', '', ''],
      correct_answer: [],
      time: '',
      difficulty_level: lastSelectedDifficulty,
      meta: {},
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(questions.length);
  };

  const handleBack = () => {
    router.push('/questions');
  };

  const handleSave = async () => {
    // Reset validation errors
    setValidationErrors({});

    let hasErrors = false;
    const errors: { [key: number]: string } = {};

    questions.forEach((q, index) => {
      errors[index] = '';
      if (q.question.trim() === '') {
        errors[index] = 'Question cannot be empty';
        hasErrors = true;
        return;
      }
      // if (q?.time?.trim() === '') {
      //   errors[index] = 'Time cannot be empty';
      //   hasErrors = true;
      //   return;
      // }

      // Validate code snippet
      if (q.type === 'code_snippet' || q.type === 'code_snippet_with_mcq') {
        const codeSnippet = (q.meta?.code || '') as string;
        if (!codeSnippet.trim()) {
          errors[index] = 'Code snippet cannot be empty';
          hasErrors = true;
          return;
        }
      }

      // Validate MCQ and multiple select options
      if (q.type === 'mcq' || q.type === 'multiple_select' || q.type === 'code_snippet' || q.type === 'code_snippet_with_mcq') {
        const nonEmptyOptions = q.options.filter((option) => option.trim() !== '');
        const minOptions = q.type === 'code_snippet' ? 2 : 4;

        if (nonEmptyOptions.length < minOptions) {
          errors[index] = `This question requires at least ${minOptions} options (currently has ${nonEmptyOptions.length})`;
          hasErrors = true;
        } else {
          const uniqueOptions = new Set(nonEmptyOptions);
          if (uniqueOptions.size !== nonEmptyOptions.length) {
            errors[index] = 'Duplicate options are not allowed';
            hasErrors = true;
          }
        }

        if (q.correct_answer.length === 0) {
          errors[index] = errors[index] || 'Please select at least one correct answer';
          hasErrors = true;
        }
      } else if (q.type === 'text' && q.correct_answer.length === 0) {
        errors[index] = 'Please provide a correct answer';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      // Set selected question to the first question with an error
      const firstErrorIndex = Object.entries(errors).find(([, error]) => error)?.[0];
      if (firstErrorIndex) {
        setSelectedQuestion(parseInt(firstErrorIndex));
      }
      showSingleToast('Please fix the validation errors before saving.');
      return;
    }

    // if (isValidTechnology) {
      try {
        const response = await updateTrigger({ name, questions });
        toast.success(response.message || 'Technology saved successfully!');
        router.push('/questions');
        mutate((key: string) => typeof key === 'string' && key.startsWith('/technology/list'));
      } catch (error) {
        if(isAxiosError(error)){
          const duplicateQuestions = error.response?.data?.data?.questions;
          duplicateQuestions?.map((item: string) => {
            const questionIndex = questions.findIndex((q) => {
              // Allow duplicate questions for code_snippet_with_mcq and code_snippet types
              if (q.type === 'code_snippet_with_mcq' || q.type === 'code_snippet') {
                return false;
              }
              return q.question === item;
            });
            if (questionIndex !== -1) {
              errors[questionIndex] = 'Question is already exists';
            }
          });
          setValidationErrors(errors);

          showSingleToast(error.response?.data?.message || 'Failed to save technology.')
      }else{ 
        showSingleToast( 'Failed to save technology.');
      }
    }
    // } else {
    //   try {
    //     const response = await trigger({ name, questions });
    //     toast.success(response.message || 'Technology created successfully!');
    //     window.history.replaceState(null, '', `/questions/create-question/${response.data.id}`);
    //     setTechnologyId(response.data.id);
    //     router.push('/questions');
    //     mutate((key: string) => typeof key === 'string' && key.startsWith('/technology/list'));
    //   } catch (error) {
    //     showSingleToast(
    //       isAxiosError(error)
    //         ? error.response?.data?.message || 'Failed to save technology.'
    //         : 'Failed to save technology.'
    //     );
    //   }
    // }
  };
  const handleSelectTechnology = (value: string) => {
    setTechnology(value);
    const selectedTech = technologyData?.data?.list.find(
      (tech: { id: string; name: string }) => tech.id === value
    );
    
    if (selectedTech) {
      setName(selectedTech.name);
      window.history.replaceState(null, '', `/questions/create-question/${selectedTech.id}`);
      // router.push(`/questions/create-question/${selectedTech.id}`);
      setTechnologyId(selectedTech.id);
      // setIsValidTechnology(isValidUUID(selectedTech.id));
    }
  };
  type TechnologyData = {
    data?: {
      list?: { id: string; name: string }[];
    };
  };

  const getTechnologyOptions = (technologyData: TechnologyData) => {
    return (
      technologyData?.data?.list?.map((tech: { id: string; name: string }) => ({
        value: tech.id,
        label: tech.name,
      })) || []
    );
  };

  return (
    <div className="px-2 py-6 flex flex-col h-screen">
      {/* Header with back button and technology selection */}
      <div className="flex justify-start items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>{' '}
        <div className="text-2xl font-bold text-gray-900 dark:text-white w-full flex items-end gap-2">
          <div className="flex-grow">
            <FormField
              type="select"
              placeholder="Technology"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300 w-full"
              value={ technology}
              onChange={(value: string) => {
                handleSelectTechnology(value);
              }}
              options={getTechnologyOptions(technologyData)}
            />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleSave}
            disabled={ updating}
          >
            Save
          </Button>
        </div>
      </div>
      <StatusWrapper className="p-6 dark:bg-gray-900 min-h-[500px] transition-all duration-300">
        <div className="flex gap-6">
          {/* Sidebar for questions no. list */}
          {questions.length ? (
            <QuestionSidebar
              questions={questions}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              handleDeleteQuestion={handleDeleteQuestion}
              handleAddQuestion={handleAddQuestion}
              validationErrors={validationErrors}
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
                    const newQuestion: Question = {
                      technology_id: technologyId,
                      question: '',
                      options: ['', '', '', '', '', ''],
                      correct_answer: [],
                      time: '',
                      difficulty_level: lastSelectedDifficulty,
                      type: lastSelectedType,
                      meta: {},
                    };
                    setQuestions([newQuestion]);
                  }}
                />
              ) : (
                questions[selectedQuestion] && (
                  <QuestionCard
                    question={questions[selectedQuestion]}
                    selectedQuestion={selectedQuestion}
                    questions={questions}
                    handleQuestionTypeChange={handleQuestionTypeChange}
                    handleDeleteQuestion={handleDeleteQuestion}
                    setQuestions={setQuestions}
                    handleReset={handleReset}
                    technologyId={technologyId}
                    validationError={validationErrors[selectedQuestion]}
                  />
                )
              )}
            </div>
          </div>
          {/* {!isValidTechnology && <div className="absolute h-full w-full backdrop-blur-sm"></div>} */}
        </div>
      </StatusWrapper>
    </div>
  );
};

export default CreateQuestion;