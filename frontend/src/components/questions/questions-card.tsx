import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/form/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/shared/types/app';
import {
  Dialog,
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
  mcq: { label: 'MCQ', color: 'blue' },
  code_snippet: { label: 'Code Snippet', color: 'purple' },
  code_editor: { label: 'Code Editor', color: 'yellow' },
  text: { label: 'Fill in the blanks', color: 'green' },
  multiple_select: { label: 'Multiple Select', color: 'orange' },
  video: { label: 'Video', color: 'red' },
  code_snippet_with_mcq: { label: 'Code Snippet with MCQ', color: 'indigo' },
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
  return (
    <>
      <Card className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{index}.</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words overflow-hidden">
                {question.question}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
              Created by:{' '}
              <span className="font-semibold">
                {question?.created_by_user?.name || ''}{' '}
                {question?.created_by_user?.deleted_at ? (
                  <span className="text-red-500"> (Deleted)</span>
                ) : (
                  ''
                )}
              </span>
            </div>
          </div>
          <Badge
            className={`ml-auto md:ml-0 rounded-full px-4 py-1 text-sm font-semibold shadow-sm border-0 ${badgeClass[questionType[question.type as keyof typeof questionType]?.color as keyof typeof badgeClass] || ''} transition-all duration-200`}
          >
            {questionType[question.type as keyof typeof questionType]?.label || 'Unknown'}
          </Badge>
        </div>

        {/* Options/Content */}
        <ul className="space-y-2 max-w-full mb-4">
          {(question.type == 'mcq' || question.type == 'multiple_select') && (
            <>
              {question.options
                ?.filter((option) => option !== '')
                .map((option, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 p-3 rounded-lg text-base font-medium border transition-all duration-200 ${
                      question?.correct_answer.includes(idx.toString())
                        ? 'bg-green-50 dark:bg-green-900/60 text-green-800 dark:text-green-100 border-green-200 dark:border-green-700 shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    } hover:scale-[1.02] hover:shadow-md`}
                  >
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center font-bold mr-2 shadow-sm">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="break-words whitespace-pre-wrap overflow-hidden flex-1">
                      {option}
                    </span>
                  </li>
                ))}
            </>
          )}

          {question.meta?.code ? (
            <li
              key="code"
              className="p-3 rounded-lg text-base font-mono bg-gray-900 text-green-200 border border-gray-800 shadow-inner overflow-x-auto max-w-full whitespace-pre-wrap break-all mt-2"
            >
              <pre className="overflow-x-auto max-w-full text-sm leading-relaxed">
                {question.meta?.code as string}
              </pre>
            </li>
          ) : (
            ''
          )}

          {question.meta?.videoToVideo ? (
            <div
              key="video"
              className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-2"
              dangerouslySetInnerHTML={{ __html: question.meta?.video_url || '' }}
            ></div>
          ) : (
            ''
          )}
        </ul>

        {/* Footer */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mt-2">
          {isQuestionEditable && (
            <div className="flex gap-2">
              <Button
                variant="link"
                className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-200 font-semibold px-2 py-1 rounded-md transition-colors"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant="link"
                className="text-red-600 dark:text-red-400 hover:underline hover:text-red-800 dark:hover:text-red-200 font-semibold px-2 py-1 rounded-md transition-colors"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          )}

          <Badge
            className={`rounded-full px-4 py-1 text-sm font-semibold shadow-sm border-0 ${badgeClass[difficulties[question.difficulty_level]?.color as keyof typeof badgeClass] || ''} transition-all duration-200`}
          >
            {difficulties[question.difficulty_level].label || 'Unknown'}
          </Badge>
        </div>

        {/* Delete Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 border-0 shadow-2xl bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                Are you sure?
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete the question.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-4 py-2 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(question.id);
                  setIsDeleteModalOpen(false);
                }}
                className="rounded-md px-4 py-2 font-semibold"
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
