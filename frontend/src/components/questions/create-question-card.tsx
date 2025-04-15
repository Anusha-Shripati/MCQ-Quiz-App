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
  selectedQuestion: number;
  questions: Question[] | Required<Question>[];
  handleQuestionTypeChange: (value: Question["type"], index: number) => void;
  handleDeleteQuestion: (question: Question, index: number) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
  handleReset: () => void;
  technologyId: string;
  onSave?: () => void;
  onCancel?: () => void;
  editQuestion?: boolean;
}

interface CreateQuestionPayload {
  technology_id: string;
  question: string;
  correct_answer: string[]
  options: string[];
  time: string;
  difficulty_level: Question["difficulty_level"];
  type: Question["type"];
  meta: Record<string, unknown>;

}

async function createQuestion(url: string, { arg }: { arg: CreateQuestionPayload }) {
  const response = await api.post(url, arg);
  return response;
}
const updateQuestion = async (url: string, { arg }: { arg: CreateQuestionPayload }) => {
  const response = await api.put(url, arg);
  return response;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedQuestion,
  questions,
  handleQuestionTypeChange,
  handleDeleteQuestion,
  setQuestions,
  handleReset,
  technologyId,
  onSave,
  onCancel,
  editQuestion
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
        { value: "multiple_select", label: "Multiple Choice" },
        { value: "mcq", label: "Radio Select" },
        { value: "text", label: "Fill in the Blanks" },
        { value: "code_snippet", label: "Code Snippet" },
        { value: "video", label: "Video" },
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
      time: question.time,
      difficulty_level: question.difficulty_level,
      type: question.type,
      meta: question.meta || {},
    };
    let valid = true
    if (question.type == 'mcq' || question.type == 'multiple_select') {
      question.correct_answer.forEach((opt) => {
        if (!question.options[parseInt(opt)]) {
          toast.error("Correct answer cannot be empty");
          valid = false
          return;
        }
      })
    }
    if (!valid) {
      return
    }
    try {
      let response;
      if (question.id) {
        response = await update(payload)
        toast.success("Question update successfully!");
      } else {
        response = await trigger(payload);
        toast.success("Question created successfully!");
      }
      if (response.success) {

        setQuestions((prev) => {
          const updatedQuestions = [...prev];
          const questionIndex = updatedQuestions.findIndex(q => q.id === question.id);
          updatedQuestions[questionIndex] = response.data;
          return updatedQuestions;
        }
        );
        if (editQuestion && typeof onSave !== 'undefined') {
          onSave()
        }
      }
    } catch (error: unknown) {
      console.log(error);

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


  const handleCorrectOptionChange = (optionIndex: number, index: number, type: 'mcq' | 'multiple_select', e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedQuestions = [...questions];
    if (type === 'mcq') {
      updatedQuestions[index].correct_answer = [optionIndex.toString()];
    } else {
      if (e.target.checked) {
        updatedQuestions[index].correct_answer.push(optionIndex.toString());
      } else {
        const op_index = updatedQuestions[index].correct_answer.indexOf(optionIndex.toString());
        updatedQuestions[index].correct_answer.splice(op_index, 1);

      }
    }
    setQuestions(updatedQuestions);
  };

  const handleCodeQuestions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[selectedQuestion].meta) {
      updatedQuestions[selectedQuestion].meta.code = e.target.value;
    }
    setQuestions(updatedQuestions);
  }

  return (
    <Card
      className={`h-[570px] flex flex-col 
        }`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold flex justify-between text-gray-900 dark:text-white">
          Question {selectedQuestion + 1}
          {editQuestion && <div>
            <Button variant="destructive" className="hover:bg-orange-600" onClick={onCancel}>Close</Button>
          </div>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <FormField
            label="Type"
            type="select"
            parentClassName="w-full"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            value={question.type}
            onChange={(value: Question["type"]) =>
              handleQuestionTypeChange(value, selectedQuestion)
            }
            placeholder="Question Type"
            options={questionTypeOptions}
          />
          <FormField
            label="Difficulty Type"
            type="select"
            parentClassName="w-full"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            value={question.difficulty_level}
            onChange={(value: Question["difficulty_level"]) => {
              const updatedQuestions = [...questions];
              updatedQuestions[selectedQuestion].difficulty_level = value;
              setQuestions(updatedQuestions);
            }}
            placeholder="Difficulty"
            options={questionDifficultyOptions}
          />
          <FormField
            parentClassName="w-full"
            label='Time (In minutes)'
            type="number"
            className="bg-white dark:bg-gray-800 min-w-[100px] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            placeholder="Enter time in minutes"
            value={question.time}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[selectedQuestion].time = e.target.value > 0 && e.target.value < 100  ? e.target.value : 0;
              setQuestions(updatedQuestions);
            }}
          />

        </div>

        <FormField
          label="Question"
          placeholder="Enter your question"
          value={question.question}
          onChange={(e) => {
            const updatedQuestions = [...questions];
            updatedQuestions[selectedQuestion].question = e.target.value;
            setQuestions(updatedQuestions);
          }}
          className="mb-4"
        />

        {(question.type === "mcq" || question.type === "multiple_select") && (
          <div className="space-y-2">
            {ensureFiveOptions(question.options).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                {question.type === "mcq" ? (
                  <input
                    type="radio"
                    name={`radio-${question.id}`}
                    checked={question.correct_answer.includes(i.toString())}
                    onChange={(e) => handleCorrectOptionChange(i, selectedQuestion, 'mcq', e)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={question.correct_answer.includes(i.toString())}
                    onChange={(e) => handleCorrectOptionChange(i, selectedQuestion, 'multiple_select', e)}
                  />
                )}
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    const newValue = e.target.value;
                    updatedQuestions[selectedQuestion].options[i] = newValue;
                    setQuestions(updatedQuestions);
                  }}
                  onBlur={(e) => {
                    // if same option than denied
                    const updatedQuestions = [...questions];
                    const newValue = e.target.value;
                    const op_index = updatedQuestions[selectedQuestion].options.indexOf(newValue);
                    if (op_index !== -1 && op_index !== i && newValue) {
                      updatedQuestions[selectedQuestion].options[i] = '';
                      e.target.value = '';
                      toast.error("Option already exists");
                      return;
                    }
                    setQuestions(updatedQuestions)
                  }}
                  className={i >= 4 ? "border-dashed border-gray-400" : ""}
                />
              </div>
            ))}
          </div>
        )}

        {question.type === "text" && (
          <Input
            placeholder="Enter the correct answer"
            value={question.correct_answer}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[selectedQuestion].correct_answer = [e.target.value];
              setQuestions(updatedQuestions);
            }}
          />
        )}

        {question.type === "code_snippet" && (
          <textarea
            placeholder="Enter your code snippet"
            value={question?.meta?.code || ''}
            onChange={handleCodeQuestions}
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
                  handleDeleteQuestion(question, selectedQuestion);
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
