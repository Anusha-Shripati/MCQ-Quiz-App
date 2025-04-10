import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/form/button";
import { Card } from "@/components/ui/card";
import { Question } from "@/shared/types/app";
import Link from "next/link";
import {
  Dialog,
  // DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

// interface QuestionCardProps {
//   question: Question;
// }

export const QuestionCard = ({
  question,
  handleDelete,
}: {
  question: Question;
  handleDelete: (question: Question) => void;
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const handleEditQuestion = (questionId: number) => {
  //   console.log(questionId, "questionId");
  // };

  return (
    <>
      <Card
        className={`dark:bg-gray-700 dark:text-gray-200 bg-gray-100 text-gray-800 mb-4 p-4 shadow-sm`}
      >
        <div className="text-lg font-semibold mb-2">
          {question.id}. {question.question}
        </div>
        <ul className="space-y-2">
          {question.options?.map((option, index) => (
            <li
              key={index}
              className={`p-2 rounded-md text-sm md:text-base ${
                option === question?.correctAnswer
                  ? "dark:bg-green-800 dark:text-green-100 bg-green-100 text-green-800"
                  : "dark:bg-gray-800 dark:text-gray-400 bg-gray-100 text-gray-800"
              }`}
            >
              {String.fromCharCode(65 + index)}. {option}
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="space-x-1">
            <Link
              href="/questions/create-question/[...QuestionSlug]"
              as={`/questions/create-question/${"ReactJS"}`}
              className="text-blue-500 hover:underline"
              // onClick={() => handleEditQuestion(question.id)}
            >
              Edit
            </Link>
            <Button
              variant="link"
              className="text-red-500 hover:underline"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
          <Badge
            className={`dark:bg-gray-600 dark:text-gray-200 bg-gray-200 text-gray-800" py-1 px-3`}
          >
            {question.difficulty}
          </Badge>
        </div>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Are you sure?
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone. This will permanently delete the
                question.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-900 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(question);
                  setIsDeleteModalOpen(false); // Close the modal
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};
