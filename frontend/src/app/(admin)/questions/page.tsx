"use client";
import { CategoryCard } from "@/components/questions/category-card";
import CreateCategory from "@/components/questions/create-category";
import { useEffect, useState } from "react";
import { QuestionCategory } from "@/shared/types/app";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { api, isAxiosError } from "@/lib/api";
import { useQuestionStore } from "@/store/questionStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function QuestionsPage() {
  const [categoriesArray, setCategoriesArray] = useState<QuestionCategory[]>([]);


  const { technologyFilter } = useQuestionStore()
  const { data, isLoading } = useSWR(`/technology/list?search=${technologyFilter}`, api.get);

  useEffect(() => {
    if (data) {
      setCategoriesArray(data.data.list);
    }
  }, [data]);

  const handleDelete = async (techId: string) => {
    if (window.confirm("Are you sure you want to delete this Technology?")) {
      try {
        const res = await api.delete(`/technology/${techId}`);
        if (res.success) {
          toast.success("Technology deleted successfully");
        }
        mutate(`/technology/list?search=${technologyFilter}`);
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(
            error.response.data.message || "An unexpected error occurred"
          );
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  };

  return (
    <div className="p-6 h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-secondary-foreground">
          Questions
        </h1>
        <CreateCategory
        />
      </div>

      {/* Categories Grid */}
      {isLoading && <LoadingSpinner className="w-full h-[700px]"/>}
      {!isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesArray.length > 0 ? (
          categoriesArray.map((list: QuestionCategory) => (
            <CategoryCard
              key={list.id}
              category={list}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full min-h-[80vh] flex items-center justify-center">
            <div className="text-muted-foreground">
              No technology found. Please create a new technology.
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
