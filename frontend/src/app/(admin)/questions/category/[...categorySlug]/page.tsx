"use client";

import { Button } from "@/components/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {  useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { questionsDataStatic } from "@/shared/constants/data";
import { FilterBar } from "@/components/questions/filter-bar";
import { QuestionCard } from "@/components/questions/questions-card";
import { Pagination } from "@/components/questions/pagination-for-category";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const router = useRouter();

  const difficulty = searchParams.get("difficulty");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    difficulty ? difficulty.split(",") : ["easy", "medium", "hard"]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  const filteredQuestions = useMemo(() => {
    let filtered = questionsDataStatic;

    if (selectedDifficulties.length > 0 && selectedDifficulties.length < 3) {
      filtered = filtered.filter((question) => selectedDifficulties.includes(question.difficulty));
    }

    if (searchQuery) {
      filtered = filtered.filter((question) =>
        question.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedDifficulties, searchQuery]);

  const currentQuestions = useMemo(() => {
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    return filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  }, [filteredQuestions, currentPage]);

  const handleDifficultyChange = (difficulties: string[]) => {
    setSelectedDifficulties(difficulties);
    const queryParam = difficulties.length ? `?difficulty=${difficulties.join(",")}` : "";
    router.push(queryParam);
  };

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  return (
    <div className={`p-6 flex justify-center min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
      <div
        className={`w-full max-w-6xl ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } shadow-lg rounded-lg p-6 mx-auto md:w-11/12 sm:w-full`}
      >
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {categorySlug}
          </div>
        </div>

        <FilterBar
          totalQuestions={filteredQuestions.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDifficulties={selectedDifficulties}
          onDifficultyChange={handleDifficultyChange}
        />

        <div className="w-full">
          {currentQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;