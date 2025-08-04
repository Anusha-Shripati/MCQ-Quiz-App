'use client';

import { Button } from '@/components/ui/form/button';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FilterBar } from '@/components/questions/filter-bar';
import { QuestionCard } from '@/components/questions/questions-card';
import CreateQuestionCard from '@/components/questions/create-question-card';
import Pagination from '@/components/pagination';
import { Question } from '@/shared/types/app';
import useSWR from 'swr';
import { api, isAxiosError } from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuestionStore } from '@/store/questionStore';
import { Card } from '@/components/ui/card';
import { questionEndpoint } from '@/lib/endpoint';

const   ViewQuestions = () => {
  const { technology } = useParams();
  const searchParams = useSearchParams();
  const [questionsData, setQuestionsData] = useState<Required<Question>[]>([]);

  const difficulty = searchParams.get('difficulty_level');
  const [selectedDifficulties, setSelectedDifficulties] = useState<Question['difficulty_level'][]>(
    difficulty
      ? (difficulty.split(',') as Question['difficulty_level'][])
      : ['easy', 'medium', 'hard']
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<null | number>(null);
  const [prvQuestion, setPrvQuestion] = useState<null | Required<Question>>(null);
  const { setQuestionFilter, questionFilter } = useQuestionStore();

  const { data, isLoading, mutate } = useSWR(
    `/question/list?technology_id=${technology}&search=${questionFilter.search}&difficulty_level=${questionFilter.difficulty}&page=${currentPage}&limit=${itemsPerPage}`,
    api.get
  );

  useEffect(() => {
    if (data?.data?.list) {
      setQuestionsData(data?.data?.list);
      setTotal(data?.data?.total);
    }
  }, [data]);

  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // updateQueryParams({ page: page.toString() });
  };

  // const pathname = usePathname();

  // const updateQueryParams = (params: { page?: string; perPage?: string }) => {
  //   const newParams = new URLSearchParams(searchParams.toString());

  //   if (params.page) newParams.set("page", params.page);
  //   if (params.perPage) newParams.set("perPage", params.perPage);
  //   window.history.pushState(null, "", `${pathname}?${newParams.toString()}`);
  // };

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuestionFilter(searchQuery, selectedDifficulties);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedDifficulties]);

  const handleDifficultyChange = (difficulties: Question['difficulty_level'][]) => {
    setSelectedDifficulties(difficulties);
    // const queryParam = difficulties.length
    //   ? `?difficulty_level=${difficulties.join(",")}`
    //   : "";
    // router.push(queryParam);
  };

  const handleDelete = async (id: string) => {
    try {
      if (id) {
        await api.delete(`/question/${id}`);
        mutate(
          (key: string) =>
            typeof key === 'string' && key.startsWith(`/question/list?technology_id=${technology}`)
        );
      }
      setSelectedQuestion(null);
      toast.success('Successfully deleted question.');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(
        isAxiosError(error)
          ? error?.response?.data?.message || 'Failed to delete question'
          : 'Failed to delete question'
      );
    }
  };

  const handleEdit = (index: number) => {
    setSelectedQuestion(index);
    setPrvQuestion(JSON.parse(JSON.stringify(questionsData[index])));
  };

  const currentPageStart = useMemo(
    () => (currentPage - 1) * itemsPerPage + 1,
    [itemsPerPage, currentPage]
  );
  const currentPageEnd = useMemo(
    () => Math.min(currentPage * itemsPerPage, total),
    [itemsPerPage, total, currentPage]
  );

  const handleQuestionTypeChange = (value: Question['type'], index: number) => {
    const updatedQuestions = [...questionsData];
    updatedQuestions[index].type = value;
    updatedQuestions[index].options = ['', '', '', '', '', ''];
    updatedQuestions[index].correct_answer = [];
    updatedQuestions[index].meta = {};
    if (value === 'code_snippet' || value === 'code_editor' || value === 'text') {
      updatedQuestions[index].correct_answer = [];
      updatedQuestions[index].options = [];
      if (updatedQuestions[index]?.meta?.code === undefined) {
        updatedQuestions[index].meta = { code: '' };
      }
    }
    setQuestionsData(updatedQuestions);
  };

  const handleReset = (type:'question' |'answer' | 'all') => {
    setQuestionsData((prv) =>
      prv.map((item, index) => (selectedQuestion == index && prvQuestion ? {
        ...prvQuestion,
        question: type == 'all' ||  type == 'question' ?'':item.question,
        options: type == 'all' ||  type == 'answer' ? ['', '', '', '', '', '']:item.options,
        correct_answer: type == 'all' ||  type == 'answer'?  []:item.correct_answer,
        time: type == 'all' ?  '':item.time,
        difficulty_level: type == 'all'?'easy':item.difficulty_level,
        type: type == 'all'?'mcq':item.type,
        meta: type == 'all' || type == 'answer'?{}:item.meta,
      } : item))
    );  
  };
  const handleSave = async (question: Question) => {
    try {
      // Validate question before saving
      if (!question.question.trim()) {
        toast.error('Question cannot be empty');
        return;
      }

      // Validate MCQ and multiple select questions
      if (question.type === 'mcq' || question.type === 'multiple_select' || question.type === 'code_snippet_with_mcq') {
        const nonEmptyOptions = question.options.filter((option) => option.trim() !== '');
        
        if (nonEmptyOptions.length < 4) {
          toast.error(`This question requires at least 4 options (currently has ${nonEmptyOptions.length})`);
          return;
        }

        // Check for duplicate options
        const uniqueOptions = new Set(nonEmptyOptions);
        if (uniqueOptions.size !== nonEmptyOptions.length) {
          toast.error('Duplicate options are not allowed');
          return;
        }

        // Check if at least one correct answer is selected
        if (question.correct_answer.length === 0) {
          toast.error('Please select at least one correct answer before saving.');
          return;
        }
      }

      // Validate text questions
      if (question.type === 'text' && question.correct_answer.length === 0) {
        toast.error('Please provide a correct answer');
        return;
      }

      // Validate code snippet questions
      if (question.type === 'code_snippet' || question.type === 'code_snippet_with_mcq') {
        const codeSnippet = (question.meta?.code || '') as string;
        if (!codeSnippet.trim()) {
          toast.error('Code snippet cannot be empty');
          return;
        }
      }

      question.options = question.options.filter((item) => item.trim());
      const payload = {
        options: question.options.filter((item) => item.trim()),
        technology_id: question.technology_id,
        question: question.question,
        correct_answer: question.correct_answer,
        difficulty_level: question.difficulty_level,
        type: question.type,
        meta: question.meta,
        // time: question.time,
      };
      await api.put(`${questionEndpoint.QUESTION_BY_ID}/${question.id}`, payload);
      setSelectedQuestion(null);
      mutate(
        (key: string) =>
          typeof key === 'string' && key.startsWith(`/question/list?technology_id=${technology}`)
      );
      toast.success('Successfully updated');
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error?.response?.data?.message || 'Failed to update'
          : 'Failed to update'
      );
    }
  };

  return (
    <div className="h-[calc(100vh-78px)] flex flex-col px-2 py-5">
      {' '}
      <Card className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-2xl font-bold ml-2">{data?.data?.technology?.name}</div>
        </div>

        <div className="sticky z-10 px-6 py-4">
          <FilterBar
            totalQuestions={questionsData.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDifficulties={selectedDifficulties}
            onDifficultyChange={handleDifficultyChange}
            technology={technology as string}
          />
        </div>

        <div className="flex-grow overflow-y-auto px-4 py-2 space-y-4">
          {questionsData.length === 0 && (
            <div className="flex justify-center items-center h-80 dark:text-white-500">No questions found. Please add some questions.</div>
          )}
          {questionsData.map((question: Required<Question>, index) => (
            <React.Fragment key={index}>
              {selectedQuestion !== index && (
                <QuestionCard
                  index={currentPageStart + index}
                  question={question}
                  handleDelete={handleDelete}
                  handleEdit={() => handleEdit(index)}
                />
              )}
              {selectedQuestion === index && (
                <CreateQuestionCard
                  question={questionsData[selectedQuestion]}
                  selectedQuestion={selectedQuestion}
                  questions={questionsData}
                  handleQuestionTypeChange={handleQuestionTypeChange}
                  handleDeleteQuestion={() => handleDelete(question.id)}
                  setQuestions={
                    setQuestionsData as React.Dispatch<
                      React.SetStateAction<Question[] | Required<Question>[]>
                    >
                  }
                  handleReset={handleReset}
                  technologyId={technology as string}
                  editQuestion={true}
                  onSave={() => handleSave(question)}
                  onCancel={() => {
                    // Reset to original state before closing
                    if (prvQuestion) {
                      setQuestionsData((prv) =>
                        prv.map((item, index) => 
                          selectedQuestion === index ? { ...prvQuestion } : item
                        )
                      );
                    }
                    setSelectedQuestion(null);
                    setPrvQuestion(null);
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="sticky bottom-0 z-10 py-2">
          <Pagination
            currentPageStart={currentPageStart}
            currentPageEnd={currentPageEnd}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPerPageChange={handlePerPageChange}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            loading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};

export default ViewQuestions;
