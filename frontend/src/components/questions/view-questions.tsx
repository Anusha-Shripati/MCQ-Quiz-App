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
        question: type == 'all' ||  type == 'question' ?prvQuestion.question:item.question,
        options: type == 'all' ||  type == 'question' ? prvQuestion.options:item.options,
        correct_answer: type == 'all' ||  type == 'answer'?  prvQuestion.correct_answer:item.correct_answer,
        time: type == 'all' ?  prvQuestion.time:item.time,
        difficulty_level: type == 'all'?prvQuestion.difficulty_level:item.difficulty_level,
        type: type == 'all'?prvQuestion.type:item.type,
        meta: type == 'all' || type == 'question'?prvQuestion.meta:item.meta,
      } : item))
    );
  };
  const handleSave = async (question: Question) => {
    try {
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
                    handleReset('all');
                    setSelectedQuestion(null)}
                  }
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
