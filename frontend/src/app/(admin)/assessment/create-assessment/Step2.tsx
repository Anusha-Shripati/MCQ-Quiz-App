import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Category = {
  name: string;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
};

type Step2Props = {
  formData: { categories: Category[] };
  targetQuestions: number;
  setTargetQuestions: (value: number) => void;
  handleDifficultySliderChange: (difficulty: "easy" | "medium" | "hard", percentage: number) => void;
  handleQuestionCountChange: (index: number, difficulty: "easy" | "medium" | "hard", value: string) => void;
  calculateTotalSum: () => number;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
};

const Step2: React.FC<Step2Props> = ({
  formData,
  targetQuestions,
  setTargetQuestions,
  handleDifficultySliderChange,
  handleQuestionCountChange,
  handlePreviousStep,
  handleNextStep,
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="font-bold dark:text-white">Question Distribution</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Set the number of questions for each difficulty level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-lg font-medium dark:text-white">Total Questions</h3>
          <Input
            type="number"
            value={targetQuestions}
            onChange={(e) => setTargetQuestions(parseInt(e.target.value))}
            className="w-24 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0"
          />
        </div>
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
          <div className="dark:text-gray-300">Technology</div>
          {["easy", "medium", "hard"].map((difficulty) => {
            const totalForDifficulty = formData.categories.reduce(
              (sum, cat) => sum + cat.questions[difficulty as "easy" | "medium" | "hard"],
              0
            );
            const percentage = targetQuestions > 0 ? Math.round((totalForDifficulty / targetQuestions) * 100) : 0;
            const colors = {
              easy: "bg-green-500 dark:bg-green-600",
              medium: "bg-blue-500 dark:bg-blue-600",
              hard: "bg-red-500 dark:bg-red-600",
            };

            return (
              <div key={difficulty} className="text-center">
                <div className="mb-2 capitalize dark:text-gray-300">{difficulty}</div>
                <div
                  className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const newPercentage = Math.round((x / rect.width) * 100);
                    handleDifficultySliderChange(difficulty as "easy" | "medium" | "hard", newPercentage);
                  }}
                >
                  <div className={`h-full ${colors[difficulty as "easy" | "medium" | "hard"]} rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-300 border-2 border-blue-600 dark:border-blue-500 rounded-full cursor-grab" style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }} />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{percentage}%</div>
              </div>
            );
          })}
          <div className="text-center dark:text-gray-300">Total</div>
        </div>
        <div className="space-y-4">
          {formData.categories.map((category, index) => {
            return (
              <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-white">{category.name}</span>
                </div>
                {["easy", "medium", "hard"].map((difficulty) => (
                  <div key={difficulty} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={category.questions[difficulty as "easy" | "medium" | "hard"]}
                      onChange={(e) => handleQuestionCountChange(index, difficulty as "easy" | "medium" | "hard", e.target.value)}
                      className="w-16 text-center mx-auto bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
                <div className="text-center font-medium dark:text-white">
                  {category.questions.easy + category.questions.medium + category.questions.hard}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-4">
        <Button variant="outline" onClick={handlePreviousStep} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNextStep} className="dark:bg-blue-600 dark:hover:bg-blue-700">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Step2;
