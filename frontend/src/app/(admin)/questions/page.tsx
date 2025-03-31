"use client";
import { CategoryCard } from "@/components/questions/category-card";
import CreateCategory from "@/components/questions/create-category";
import { categories } from "@/shared/constants/data";
import { useState } from "react";
import { QuestionCategory } from "@/shared/types/app";
import toast from "react-hot-toast";

export default function QuestionsPage() {
  const [categoriesArray, setCategoriesArray] = useState(categories);

  const handleDelete = (category: QuestionCategory) => {
    console.log(category, "category");
    setCategoriesArray(
      categoriesArray.filter((cat) => cat.name !== category.name)
    );
    toast.success("Category deleted successfully");
  };
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-secondary-foreground">
          Questions
        </h1>
        <CreateCategory setCategoriesArray={setCategoriesArray} />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesArray.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
