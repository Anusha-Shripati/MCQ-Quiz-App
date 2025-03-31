import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/form/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/form/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/form/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Question } from "@/shared/types/app";
import { FormField } from "../common/form-field";

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedQuestion: number;
  questions: Question[];
  handleQuestionTypeChange: (value: Question["type"], index: number) => void;
  handleCorrectOptionChange: (optionIndex: number, index: number) => void;
  handleDeleteQuestion: (index: number) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  selectedQuestion,
  questions,
  handleQuestionTypeChange,
  handleCorrectOptionChange,
  handleDeleteQuestion,
  setQuestions,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Ensure 6 options for multiple-choice and radio-select
  const ensureSixOptions = (options: string[] | undefined) => {
    if (!options) return Array(5).fill("");
    while (options.length < 5) {
      options.push("");
    }
    return options.slice(0, 5); // Ensure only 6 options
  };
  const questionTypeOptions = useMemo(
    () =>
      [
        { value: "multiple-choice", label: "Multiple Choice" },
        { value: "radio-select", label: "Radio Select" },
        { value: "fill-in-the-blanks", label: "Fill in the Blanks" },
        { value: "code-snippet", label: "Code Snippet" },
      ] as { value: Question["type"]; label: string }[],
    []
  );

  const questionDifficultyOptions = useMemo(
    () =>
      [
        { value: "easy", label: "Easy" },
        { value: "medium", label: "Medium" },
        { value: "hard", label: "Hard" },
      ] as { value: Question["difficulty"]; label: string }[],
    []
  );

  return (
    <Card
      className={` h-[570px] flex flex-col ${selectedQuestion === index ? "" : "hidden"}`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          Question {question.id}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <FormField
            type="select"
            parentClassName="w-full"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            value={question.type}
            onChange={(value: Question["type"]) =>
              handleQuestionTypeChange(value, index)
            }
            placeholder="Question Type"
            options={questionTypeOptions}
          />
          <FormField
            type="select"
            parentClassName="w-full"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            value={question.difficulty}
            onChange={(value: Question["difficulty"]) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].difficulty = value;
              setQuestions(updatedQuestions);
            }}
            placeholder="Difficulty"
            options={questionDifficultyOptions}
          />
        </div>

        <Input
          placeholder="Enter your question"
          value={question.question}
          onChange={(e) => {
            const updatedQuestions = [...questions];
            updatedQuestions[index].question = e.target.value;
            setQuestions(updatedQuestions);
          }}
          className="mb-4"
        />

        {(question.type === "multiple-choice" ||
          question.type === "radio-select") && (
          <div className="space-y-2">
            {ensureSixOptions(question.options).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                {question.type === "radio-select" ? (
                  <input
                    type="radio"
                    name={`radio-${question.id}`}
                    checked={question.correctOptions?.includes(i)}
                    onChange={() => handleCorrectOptionChange(i, index)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={question.correctOptions?.includes(i)}
                    onChange={() => handleCorrectOptionChange(i, index)}
                  />
                )}
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[index].options![i] = e.target.value;
                    setQuestions(updatedQuestions);
                  }}
                  className={i >= 4 ? "border-dashed border-gray-400" : ""}
                />
              </div>
            ))}
          </div>
        )}

        {question.type === "fill-in-the-blanks" && (
          <Input
            placeholder="Enter the correct answer"
            value={question.answer}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].answer = e.target.value;
              setQuestions(updatedQuestions);
            }}
          />
        )}

        {question.type === "code-snippet" && (
          <textarea
            placeholder="Enter your code snippet"
            value={question.code}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].code = e.target.value;
              setQuestions(updatedQuestions);
            }}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            rows={10}
          />
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Question</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                question.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteQuestion(index); // Delete the question
                  setIsDeleteModalOpen(false); // Close the modal
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
