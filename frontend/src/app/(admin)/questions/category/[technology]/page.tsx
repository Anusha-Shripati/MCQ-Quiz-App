"use client";

import { Button } from "@/components/ui/form/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { FilterBar } from "@/components/questions/filter-bar";
import { QuestionCard } from "@/components/questions/questions-card";
import CreateQuestionCard from "@/components/questions/create-question-card";
import { Pagination } from "@/components/questions/pagination-for-category";
import { Question } from "@/shared/types/app";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const CategoryPage = () => {
  const { technology } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questionsData, setQuestionsData] =
    useState<Required<Question>[]>([]);

  const { data } = useSWR(
    `/question/list?technology_id=${technology}`,
    api.get
  );

  useEffect(() => {
    if (data?.data?.questions) {
      setQuestionsData(data?.data?.questions);
    }
  }, [data]);



  const difficulty = searchParams.get("difficulty");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    difficulty ? difficulty.split(",") : ["easy", "medium", "hard"]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<null | number>(null);
  const questionsPerPage = 5;

  const filteredQuestions = useMemo(() => {
    let filtered = [...questionsData];

    if (selectedDifficulties.length > 0 && selectedDifficulties.length < 3) {
      filtered = filtered.filter((question) =>
        selectedDifficulties.includes(question.difficulty_level)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((question) =>
        question.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedDifficulties, searchQuery, questionsData]);

  const currentQuestions = useMemo(() => {
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    return filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  }, [filteredQuestions, currentPage]);

  const handleDifficultyChange = (difficulties: string[]) => {
    setSelectedDifficulties(difficulties);
    const queryParam = difficulties.length
      ? `?difficulty=${difficulties.join(",")}`
      : "";
    router.push(queryParam);
  };

  const handleDelete = async (id: string) => {
    try {
      if (id) {
        await api.delete(`/question/${id}`);
        mutate((key: string) => typeof key === 'string' && key.startsWith(`/question/list?technology_id=${technology}`))
      }
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const handleEdit = (index: number) => {
    setSelectedQuestion(index)
  }


  const handleQuestionTypeChange = (value: Question["type"], index: number) => {
    const updatedQuestions = [...currentQuestions];
    updatedQuestions[index].type = value;

    // Reset answer/options based on the new type
    if (value === "mcq" || value === "multiple_select") {
      updatedQuestions[index].options = ["", "", "", "", "", ""]; // 4 compulsory + 2 optional
      updatedQuestions[index].correct_answer = []; // Reset correct options
      // delete updatedQuestions[index].answer; // Remove answer field if it exists
      // delete updatedQuestions[index].code; // Remove code field if it exists
    } else if (value === "text") {
      updatedQuestions[index].correct_answer = [];
      // delete updatedQuestions[index].options; // Remove options field if it exists
      // delete updatedQuestions[index].correctOptions; // Remove correct options field if it exists
      // delete updatedQuestions[index].code; // Remove code field if it exists
    } else if (value === "code_snippet") {
      updatedQuestions[index].correct_answer = [];
      if (updatedQuestions[index]?.meta?.code === undefined) {
        updatedQuestions[index].meta = { code: "" };

      }
      // delete updatedQuestions[index].options; // Remove options field if it exists
      // delete updatedQuestions[index].correctOptions; // Remove correct options field if it exists
      // delete updatedQuestions[index].answer; // Remove answer field if it exists
    }

    setQuestionsData(updatedQuestions);
  };

  const handleReset = () => {
    setQuestionsData(data?.data?.questions)
  }

  return (
    <div
      className={`p-6 flex justify-center min-h-screen dark:bg-gray-900 bg-gray-100"}`}
    >
      <div
        className={`w-full max-w-6xl dark:bg-gray-800 dark:text-white bg-white text-gray-900 shadow-lg rounded-lg p-6 mx-auto md:w-11/12 sm:w-full`}
      >
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div
            className={`text-2xl font-bold dark:text-white dark:text-gray-900"}`}
          >
            {data?.data?.name}
          </div>
        </div>

        <FilterBar
          totalQuestions={filteredQuestions.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDifficulties={selectedDifficulties}
          onDifficultyChange={handleDifficultyChange}
          technology={technology as string}
        />
        {currentQuestions.length == 0 && <div className="flex justify-center min-h-[500px] items-center">No data found</div>}
        <div className="w-full">
          {currentQuestions.map((question: Required<Question>, index) => (
            <>
              {selectedQuestion !== index && <QuestionCard
                index={index}
                key={question.id}
                question={question}
                handleDelete={handleDelete}
                handleEdit={() => handleEdit(index)}
              />}

              {selectedQuestion == index && <CreateQuestionCard
                question={currentQuestions[selectedQuestion as number]}
                selectedQuestion={selectedQuestion}
                questions={currentQuestions}
                handleQuestionTypeChange={handleQuestionTypeChange}
                handleDeleteQuestion={() => handleDelete(question.id as string)}
                setQuestions={setQuestionsData as any}
                handleReset={handleReset}
                technologyId={technology as string}
                editQuestion={true}
                onSave={() => setSelectedQuestion(null)}
                onCancel={() => setSelectedQuestion(null)}
              />}
            </>
          ))}
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
