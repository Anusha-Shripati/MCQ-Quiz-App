"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const CategoryActions = ({ category }: { category: QuestionCategory }) => {
  const handleAddQuestions = () => {
    console.log("Add Questions");
  };

  const handleViewCategory = (categoryName: string) => {
    console.log("View category", categoryName);
  };

  return (
    <div>
      <div className="mt-4 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-secondary/80"
          onClick={handleAddQuestions}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Questions
        </Button>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(0,0,0,0.2)] active:translate-y-0 active:shadow-none transition-all duration-250"
          onClick={() => handleViewCategory(category.name)}
        >
          View
        </Button>
      </div>
    </div>
  );
};

export default CategoryActions;

