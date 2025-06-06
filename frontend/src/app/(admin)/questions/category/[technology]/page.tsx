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
import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuestionStore } from '@/store/questionStore';

const CategoryPage = () => {
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
  const { setQuestionFilter, questionFilter } = useQuestionStore();

  const { data, isLoading } = useSWR(
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
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleEdit = (index: number) => {
    setSelectedQuestion(index);
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

  const handleReset = () => {
    setQuestionsData(data?.data?.questions);
  };

  return (
    <div className={`p-6 flex justify-center min-h-screen dark:bg-gray-900 bg-gray-100"}`}>
      <div
        className={`w-full flex flex-col max-w-6xl dark:bg-gray-800 dark:text-white bg-white text-gray-900 shadow-lg rounded-lg p-6 mx-auto md:w-11/12 sm:w-full`}
      >
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`text-2xl font-bold dark:text-white dark:text-gray-900"}`}>
            {data?.data?.technology?.name}
          </div>
        </div>

        <FilterBar
          totalQuestions={questionsData.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDifficulties={selectedDifficulties}
          onDifficultyChange={handleDifficultyChange}
          technology={technology as string}
        />
        <Pagination
          className="flex-grow h-full"
          currentPageStart={currentPageStart}
          currentPageEnd={currentPageEnd}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPerPageChange={handlePerPageChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          loading={isLoading}
        >
          <div className="w-full min-h-[600px]">
            {questionsData.map((question: Required<Question>, index) => (
              <React.Fragment key={index}>
                {selectedQuestion !== index && (
                  <QuestionCard
                    index={index}
                    key={index}
                    question={question}
                    handleDelete={handleDelete}
                    handleEdit={() => handleEdit(index)}
                  />
                )}

                {selectedQuestion == index && (
                  <CreateQuestionCard
                    question={questionsData[selectedQuestion as number]}
                    selectedQuestion={selectedQuestion}
                    questions={questionsData}
                    handleQuestionTypeChange={handleQuestionTypeChange}
                    handleDeleteQuestion={() => handleDelete(question.id as string)}
                    setQuestions={
                      setQuestionsData as React.Dispatch<
                        React.SetStateAction<Question[] | Required<Question>[]>
                      >
                    }
                    handleReset={handleReset}
                    technologyId={technology as string}
                    editQuestion={true}
                    onSave={() => setSelectedQuestion(null)}
                    onCancel={() => setSelectedQuestion(null)}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </Pagination>
      </div>
    </div>
  );
};

export default CategoryPage;
