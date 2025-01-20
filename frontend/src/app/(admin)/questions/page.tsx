"use client"
import { CategoryCard } from "@/components/questions/category-card";
import CreateCategory from "@/components/questions/create-category";
import { categories } from "@/shared/constants/data";
import { useState } from "react";

export default function QuestionsPage() {
  const [ categoriesArray, setCategoriesArray ] = useState(categories);
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-secondary-foreground">
          Questions
        </h1>
        <CreateCategory setCategoriesArray={setCategoriesArray}/>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesArray.map((category, index) => (
          <CategoryCard key={index} category={category} />
        ))}
      </div>
    </div>
  );
}
