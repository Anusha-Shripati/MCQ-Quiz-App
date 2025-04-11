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
import { toast } from "react-hot-toast";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedQuestion: number;
  questions: Question[];
  handleQuestionTypeChange: (value: Question["type"], index: number) => void;
  handleDeleteQuestion: (index: number) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  handleReset: () => void;
  technologyId: string;
}

interface CreateQuestionPayload {
  technology_id: string;
  question: string;
  correct_answer: string;
  options: string[];
  time: string;
  difficulty_level: Question["difficulty_level"];
  type: Question["type"];
  meta: Record<string, unknown>;
}

async function createQuestion(url: string, { arg }: { arg: CreateQuestionPayload }) {
  const response = await api.post(url, arg);
  return response.data;
}
const updateQuestion = async (url: string, { arg }: { arg: CreateQuestionPayload }) => {
  const response = await api.put(url, arg);
  return response.data;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  selectedQuestion,
  questions,
  handleQuestionTypeChange,
  handleDeleteQuestion,
  setQuestions,
  handleReset,
  technologyId,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const ensureFiveOptions = (options: string[] = []) => {
    while (options.length < 5) {
      options.push("");
    }
    return options.slice(0, 5);
  };

  const questionTypeOptions = useMemo(
    () =>
      [
        { value: "mcq", label: "Multiple Choice" },
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
      ] as { value: Question["difficulty_level"]; label: string }[],
    []
  );

  const { trigger, isMutating } = useSWRMutation(`/question/create`, createQuestion);
  const { trigger: update, isMutating: updating } = useSWRMutation(`/question/${question.id}`, updateQuestion);


  const handleSave = async () => {
    const payload = {
      technology_id: technologyId,
      question: question.question,
      correct_answer: question.correct_answer,
      options: question.options.filter((opt) => opt.trim() !== ""),
      time: "2",
      difficulty_level: question.difficulty_level,
      type: question.type,
      meta: {},
    };
    try {
      let response;
      if (question.id) {
        response = await update(payload)
        toast.success("Question update successfully!");
      } else {
        response = await trigger(payload);
        toast.success("Question created successfully!");
      }
      console.log(response, "response");
    } catch (error: unknown) {
      
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Something went wrong.");
    }

    console.log("Payload to be sent:", payload);

    // Optionally send it via an API:
    // await fetch('/api/question', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });
  };


  const handleCorrectOptionChange = (option: string, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].correct_answer = option;
    setQuestions(updatedQuestions);
  };

  return (
    <Card
      className={`h-[570px] flex flex-col ${selectedQuestion === index ? "" : "hidden"
        }`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          Question {index + 1}
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
            value={question.difficulty_level}
            onChange={(value: Question["difficulty_level"]) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].difficulty_level = value;
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

        {(question.type === "mcq" || question.type === "radio-select") && (
          <div className="space-y-2">
            {ensureFiveOptions(question.options).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                {question.type === "radio-select" ? (
                  <input
                    type="radio"
                    name={`radio-${question.id}`}
                    checked={question.correct_answer === option}
                    onChange={() => handleCorrectOptionChange(option, index)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={question.correct_answer === option}
                    onChange={() => handleCorrectOptionChange(option, index)}
                  />
                )}
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    const newValue = e.target.value;
                    updatedQuestions[index].options[i] = newValue;

                    // If this was the correct answer, update it
                    if (option === question.correct_answer) {
                      updatedQuestions[index].correct_answer = newValue;
                    }

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
            value={question.correct_answer}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].correct_answer = e.target.value;
              setQuestions(updatedQuestions);
            }}
          />
        )}

        {question.type === "code-snippet" && (
          <textarea
            placeholder="Enter your code snippet"
            value={question.correct_answer}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].correct_answer = e.target.value;
              setQuestions(updatedQuestions);
            }}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            rows={10}
          />
        )}
      </CardContent>
      <CardFooter className="mt-auto flex justify-between items-center">
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="hover:bg-orange-600">
              Delete Question
            </Button>
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
                  handleDeleteQuestion(index);
                  setIsDeleteModalOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {questions.length !== 0 && (
          <div className="mt-2 flex justify-end gap-4">
            <Button variant="outline" onClick={handleReset} disabled={isMutating || updating}>
              Reset
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isMutating || updating}>
              Save
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
