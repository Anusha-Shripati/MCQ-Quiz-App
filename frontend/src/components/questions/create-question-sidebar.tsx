import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/form/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { useSearchParams, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { DeleteDialog } from '../common/delete-dialog';
import { Question } from '@/shared/types/app';

interface QuestionSidebarProps {
  questions: Question[];
  selectedQuestion: number;
  setSelectedQuestion: (index: number) => void;
  handleDeleteQuestion: ( index: number) => void;
  handleAddQuestion: () => void;
  validationErrors?: {[key: number]: string}; // Add validation errors prop
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  selectedQuestion,
  setSelectedQuestion,
  handleDeleteQuestion,
  handleAddQuestion,
  validationErrors = {}
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number|null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateQueryParams = useCallback(
    (params: { ques?: string }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (params.ques) newParams.set('ques', params.ques);
      window.history.pushState(null, '', `${pathname}?${newParams.toString()}`);
    },
    [searchParams, pathname]
  );

  const handleQuestionChange = useCallback(
    (index: number) => {
      setSelectedQuestion(index);
      updateQueryParams({ ques: (index + 1).toString() });
    },
    [setSelectedQuestion, updateQueryParams]
  );

  const openDeleteModal = useCallback((index: number) => {
    setQuestionToDelete(index);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (questionToDelete !== null) {
      handleDeleteQuestion(questionToDelete);
    }
    setQuestionToDelete(null);
    
  }, [questionToDelete, handleDeleteQuestion]);

  return (
    <Card className="w-full md:w-1/4 h-[calc(100vh-12rem)] flex flex-col overflow-hidden shadow-lg  gap-2">
      {/* Header */}
      <CardHeader className="border-b border-gray-200 dark:border-border p-2 sm:p-4 flex flex-row justify-between items-center">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Questions
        </CardTitle>
        <Button
          onClick={handleAddQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 text-xs sm:text-sm"
        >
          Add Question
        </Button>
      </CardHeader>

      {/* Scrollable List */}
      <CardContent className="flex-1 p-0 overflow-hidden pb-2">
        <div className="h-full block max-h-[100%] overflow-auto">
          <ul className="space-y-1 sm:space-y-2 p-1 sm:p-2 w-100">
            {questions?.map((q, index) => (
              <li
                key={index}
                className={clsx(
                  'p-2 sm:p-3 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200 ease-in-out border w-100',
                  q.id ? '' : 'border-[#ffa500]',
                  validationErrors[index] ? 'border-red-500' : '',
                  selectedQuestion === index
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                    : 'bg-gray-50 dark:bg-primary text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                )}
                onClick={() => handleQuestionChange(index)}
              >
                <div className="flex flex-col gap-1 w-[calc(100%-2rem)]">
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {index + 1}. {q.question ? q.question : `Question ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center">
                  {validationErrors[index] && (
                    <span className="text-xs text-red-500 mr-1" title={validationErrors[index]}>⚠️</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-500/10 rounded-full p-1 sm:p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(index);
                    }}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 hover:text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      {/* Delete Modal */}
      <DeleteDialog
        isOpen={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        onDelete={confirmDelete}
      />
    </Card>
  );
};

export default QuestionSidebar;
