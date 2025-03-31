import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/form/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  // DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSearchParams, usePathname } from "next/navigation";
import clsx from "clsx";

interface QuestionSidebarProps {
  questions: {
    id: number;
    type: string;
    difficulty: string;
    question: string;
  }[];
  selectedQuestion: number;
  setSelectedQuestion: (index: number) => void;
  handleDeleteQuestion: (index: number) => void;
  handleAddQuestion: () => void;
}

const DeleteQuestionDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}> = ({ isOpen, onClose, onDelete }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
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
          onClick={onClose}
          className="text-gray-900 dark:text-white"
        >
          Cancel
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  selectedQuestion,
  setSelectedQuestion,
  handleDeleteQuestion,
  handleAddQuestion,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleQuestionChange = useCallback(
    (index: number) => {
      setSelectedQuestion(index);
      updateQueryParams({ ques: index.toString() });
    },
    [setSelectedQuestion]
  );

  const updateQueryParams = useCallback(
    (params: { ques?: string }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (params.ques) newParams.set("ques", params.ques);
      window.history.pushState(null, "", `${pathname}?${newParams.toString()}`);
    },
    [searchParams, pathname]
  );

  const openDeleteModal = useCallback((index: number) => {
    setQuestionToDelete(index);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (questionToDelete !== null) {
      handleDeleteQuestion(questionToDelete);
    }
    closeDeleteModal();
  }, [questionToDelete, handleDeleteQuestion, closeDeleteModal]);

  return (
    <Card className="w-1/4 h-[calc(100vh-8rem)] flex flex-col overflow-hidden shadow-lg bg-white dark:bg-gray-900">
      {/* Header */}
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Questions
        </CardTitle>
        <Button
          onClick={handleAddQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Add Question
        </Button>
      </CardHeader>

      {/* Scrollable List */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <ul className="space-y-1 p-2">
            {questions.map((q, index) => (
              <li
                key={q.id}
                className={clsx(
                  "p-3 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200 ease-in-out",
                  selectedQuestion === index
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
                )}
                onClick={() => handleQuestionChange(index)}
              >
                <span className="text-sm font-medium">Question {q.id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/10 rounded-full p-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the li onClick
                    openDeleteModal(index);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>

      {/* Delete Modal */}
      <DeleteQuestionDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={confirmDelete}
      />
    </Card>
  );
};

export default QuestionSidebar;
