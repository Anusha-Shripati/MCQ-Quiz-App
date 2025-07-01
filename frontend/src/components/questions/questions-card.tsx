import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/form/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/shared/types/app';
import {
  Dialog,
  // DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

// interface QuestionCardProps {
//   question: Question;
// }
const questionType = {
  mcq: { label: 'Multiple Choice', color: 'blue' },
  code_snippet: { label: 'Code Snippet', color: 'purple' },
  text: { label: 'Fill in the blanks', color: 'green' },
  multiple_select: { label: 'Multiple Select', color: 'orange' },
  video: { label: 'Video', color: 'red' },
};

const difficulties: Record<Question['difficulty_level'], { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  hard: { label: 'Hard', color: 'red' },
};

const badgeClass = {
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

export const QuestionCard = ({
  question,
  handleDelete,
  index,
  handleEdit,
}: {
  question: Required<Question>;
  index: number;
  handleDelete: (id: string) => void;
  handleEdit: () => void;
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  console.log(question);
  return (
    <>
      <Card className="dark:bg-gray-700 dark:text-gray-200 bg-gray-100 text-gray-800 mb-4 p-4 shadow-sm w-full h-card md:h-auto">
        <div className="text-lg font-semibold mb-2 flex justify-between items-start">
          <div className="break-words pr-2 flex-1 overflow-hidden">
            <span>{index}. </span>
            <span className="whitespace-pre-wrap overflow-hidden">{question.question}</span>
          </div>
          <Badge className="dark:bg-gray-600 dark:text-gray-200 bg-gray-200 text-gray-800 py-1 px-3 flex-shrink-0">
            {questionType[question.type as keyof typeof questionType]?.label || 'Unknown'}
          </Badge>
        </div>
        <ul className="space-y-2 max-w-full">
          {(question.type == 'mcq' || question.type == 'multiple_select') && (
            <>
              {question.options
                ?.filter((option) => option !== '')
                .map((option, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded-md text-sm md:text-base break-words whitespace-pre-wrap overflow-hidden ${question?.correct_answer.includes(index.toString())
                        ? 'dark:bg-green-800 dark:text-green-100 bg-green-100 text-green-800'
                        : 'dark:bg-gray-800 dark:text-gray-400 bg-gray-100 text-gray-800'
                      }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </li>
                ))}
            </>
          )}

          {question.meta?.code ? (
            <li
              key="code"
              className={`p-2 rounded-md text-sm md:text-base max-w-full whitespace-pre-wrap break-all ${question?.correct_answer.includes(index.toString())
                  ? 'dark:bg-green-800 dark:text-green-100 bg-green-100 text-green-800'
                  : 'dark:bg-gray-800 dark:text-gray-400 bg-gray-100 text-gray-800'
                }`}
            >
              <pre className="overflow-x-auto max-w-full">{question.meta?.code as string}</pre>
            </li>
          ) : (
            ''
          )}

          {question.meta?.videoToVideo ? (
            <div
              key="video"
              className="w-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: question.meta?.video_url || '' }}
            ></div>
          ) : (
            ''
          )}
        </ul>
        <div className="flex justify-between items-center mt-4 text-sm">
          {isQuestionEditable && (
            <>
              <div className="space-x-1">
                <Button
                  variant="link"
                  className="text-blue-500 hover:underline"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  className="text-red-500 hover:underline"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </>
          )}

          <Badge
            className={`${badgeClass[difficulties[question.difficulty_level]?.color as keyof typeof badgeClass] || ''} py-1 px-3`}
          >
            {difficulties[question.difficulty_level].label || 'Unknown'}
          </Badge>
        </div>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Are you sure?
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone. This will permanently delete the question.
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
                  handleDelete(question.id);
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
