'use client';
import type { Column } from '@/components/common/reusable-table';
import ReusableTable from '@/components/common/reusable-table';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/form/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionCategory } from '@/shared/types/app';
import { useAuthStore } from '@/store/authStore';
import { EyeIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface TechnologyTableProps {
  technologies: QuestionCategory[];
}

export default function TechnologyTable({ technologies }: TechnologyTableProps) {
  const router = useRouter();
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = technologies.length;
  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return technologies.slice(startIndex, endIndex);
  }, [technologies, currentPage, itemsPerPage]);

  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNavigate = (categoryId: string) => {
    router.push(`/questions/category/${categoryId}`);
  };

  const handleAddQuestion = (categoryId: string) => {
    router.push(`/questions/create-question/${categoryId}`);
  };

  const handleNavigateDifficulty = (categoryId: string, difficulty: string) => {
    router.push(`/questions/category/${categoryId}?difficulty_level=${difficulty}`);
  };

  const columns = useMemo<Array<Column<QuestionCategory>>>(
    () => [
      {
        key: 'name',
        header: 'Technology Name',
        render: (row) => (
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {row.name}
          </div>
        ),
      },
      {
        key: 'easy',
        header: 'Easy',
        render: (row) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateDifficulty(row.id, 'easy');
                }}
              >
                <span className="font-semibold text-green-600">●</span>
                <span className="font-medium">{row.difficultyCount.easy}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
              <p>Click to view Easy questions</p>
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        key: 'medium',
        header: 'Medium',
        render: (row) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateDifficulty(row.id, 'medium');
                }}
              >
                <span className="font-semibold text-orange-300">●</span>
                <span className="font-medium">{row.difficultyCount.medium}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
              <p>Click to view Medium questions</p>
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        key: 'hard',
        header: 'Hard',
        render: (row) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateDifficulty(row.id, 'hard');
                }}
              >
                <span className="font-semibold text-red-500">●</span>
                <span className="font-medium">{row.difficultyCount.hard}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
              <p>Click to view Hard questions</p>
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        key: 'total',
        header: 'Total',
        render: (row) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(row.id);
                }}
              >
                {row.difficultyCount.easy + row.difficultyCount.medium + row.difficultyCount.hard}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
              <p>Click to view all questions</p>
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="flex gap-2">
            {isQuestionEditable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddQuestion(row.id);
                    }}
                  >
                    <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    {/* <span className="text-gray-900 dark:text-gray-200 ml-1">Add</span> */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                  <p>Add new questions to this technology</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(row.id);
                  }}
                >
                  <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  {/* <span className="text-gray-900 dark:text-gray-200 ml-1">View</span> */}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                <p>View all questions for this technology</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [isQuestionEditable]
  );

  const handleRowClick = (technology: QuestionCategory) => {
    handleNavigate(technology.id);
  };

  return (
    <Pagination
      className="flex-grow"
      currentPageStart={currentPageStart}
      currentPageEnd={currentPageEnd}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPerPageChange={handlePerPageChange}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      <div className="flex-1 overflow-hidden">
        {technologies.length > 0 ? (
          <ReusableTable
            columns={columns}
            rows={currentItems}
            className="h-full animate-in fade-in duration-300"
            rowKey="id"
            onRowClick={handleRowClick}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-muted-foreground">
              No technology found. Please create a new technology.
            </div>
          </div>
        )}
      </div>
    </Pagination>
  );
}