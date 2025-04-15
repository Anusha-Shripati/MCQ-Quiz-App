"use client";
import { CategoryCard } from "@/components/questions/category-card";
import CreateCategory from "@/components/questions/create-category";
import { useEffect, useState } from "react";
import { QuestionCategory } from "@/shared/types/app";
import toast from "react-hot-toast";
import useSWR from "swr";
import { api } from "@/lib/api";

export default function QuestionsPage() {
  const [categoriesArray, setCategoriesArray] = useState<QuestionCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<QuestionCategory[]>([]); // Track filtered list
  const {data} = useSWR('/technology/list', api.get);
  useEffect(() => {
    if (data) {
      setCategoriesArray(data.data.list);
      setFilteredCategories(data.data.list);
    }
  }, [data]);
  
  const handleDelete = (category: QuestionCategory) => {
    const updatedCategories = categoriesArray.filter(
      (cat) => cat.name !== category.name
    );
    setCategoriesArray(updatedCategories);
    setFilteredCategories(updatedCategories);
    toast.success("Category deleted successfully");
  };

  return (
    <div className="p-6 h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-secondary-foreground">
          Questions
        </h1>
        <CreateCategory
          categoriesArray={categoriesArray}
          setFilteredCategories={setFilteredCategories}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((list: QuestionCategory) => (
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
      </div>
    </div>
  );
}
