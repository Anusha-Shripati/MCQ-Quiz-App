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
import { isValidUUID, showSingleToast } from '@/lib/utils';
import { isAxiosError } from 'axios';
import { questionEndpoint, technologyEndpoint } from '@/lib/endpoint';
// import { isValidObjectId } from '@/lib/utils';



async function create(url: string, { arg }: { arg: { name: string, questions: Question[] } }) {
  const response = await api.post(url, arg);
  return response;
}
async function update(url: string, { arg }: { arg: { name: string, questions: Question[] } }) {
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
  const [isValidTechnology] = useState<boolean>(isValidUUID(params.technology));
  const { data, isLoading, error, isValidating, mutate: questionMutate } = useSWR(
    isValidTechnology ? `${questionEndpoint.LIST}?technology_id=${technologyId}` : null,
    api.get
  );



  const { trigger, isMutating } = useSWRMutation(`${technologyEndpoint.CREATE}`, create);
  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(
    `${technologyEndpoint.TECHNOLOGY_BY_ID}/${technologyId}`,
    update
  );

  useEffect(() => {
    setName(data?.data?.technology?.name || '');
    if (data?.data?.list?.length) {
      setQuestions(data?.data?.list);
      if (selectedQuestion > data?.data?.list.length) {
        setSelectedQuestion(data?.data?.list.length - 1);
      }
    }
  }, [data]);

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

  const handleDeleteQuestion = async (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);

    if (selectedQuestion >= updatedQuestions.length && updatedQuestions.length) {
      setSelectedQuestion(updatedQuestions.length - 1);
    } else if (updatedQuestions.length == 0) {
      setSelectedQuestion(0);
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
      updatedQuestions[index].options = [];
      if (updatedQuestions[index]?.meta?.code === undefined) {
        updatedQuestions[index].meta = { code: '' };
      }
    }
    console.log(updatedQuestions[index])
    setQuestions(updatedQuestions);

  };


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

  const handleSave = async () => {
    let message = ""
    questions.forEach((q) => {
      if (q.question.trim() == "") {
        message = "Cannot save an empty question. Please add content."
      }
      else if ((q.type == "mcq" || q.type == "multiple_select" || q.type == "text") && q.correct_answer.length == 0) {
        message = "Cannot save an empty question. Please add content."
      }
    })
    if (message) {
      showSingleToast(message)
      return
    }
    if (isValidTechnology) {
      try {
        const response = await updateTrigger({ name, questions });
        toast.success(response.message || "Technology saved successfully!");
        router.push('/questions');
        mutate((key: string) => typeof key === 'string' && key.startsWith('/technology/list'));
      } catch (error) {
        showSingleToast(isAxiosError(error) ? error.response?.data?.message || "Failed to save technology." : "Failed to save technology.");
      }
    } else {
      try {
        const response = await trigger({ name, questions });
        toast.success(response.message || "Technology created successfully!");
        window.history.replaceState(null, '', `/questions/create-question/${response.data.id}`);
        setTechnologyId(response.data.id);
        router.push('/questions');
        mutate((key: string) => typeof key === 'string' && key.startsWith('/technology/list'));
      } catch (error) {
        showSingleToast(isAxiosError(error) ? error.response?.data?.message || "Failed to save technology." : "Failed to save technology.");
      }
    }
  }

  return (
    // Main container
    <StatusWrapper className="p-6 dark:bg-gray-900 h-screen" loading={isLoading || isValidating} reset={questionMutate} error={error}>
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
            onClick={handleSave}
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

    </StatusWrapper>
  );
};

export default CreateQuestion;
