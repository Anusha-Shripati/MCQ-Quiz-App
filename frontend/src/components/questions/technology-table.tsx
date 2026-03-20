'use client';
import type { Column } from '@/components/common/reusable-table';
import ReusableTable from '@/components/common/reusable-table';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/form/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionCategory } from '@/shared/types/app';
import { useAuthStore } from '@/store/authStore';
import { EyeIcon, Plus, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { technologyEndpoint } from '@/lib/endpoint';
import { api } from '@/lib/api';
import { mutate } from 'swr';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import CreateTechnologyModal from '../ui/create-technology-modal';
interface TechnologyTableProps {
  technologies: QuestionCategory[];
}

async function updateTechnology(url: string, { arg }: { arg: { id: string; name: string } }) {
  return await api.put(url.replace(':id', arg.id), { name: arg.name });
}

type ModalType = 'add' | 'edit' | null;
export default function TechnologyTable({ technologies }: TechnologyTableProps) {
  const router = useRouter();
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [categoryName, setCategoryName] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const totalItems = technologies.length;
  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return technologies.slice(startIndex, endIndex);
  }, [technologies, currentPage, itemsPerPage]);

  // Updates a technology by calling the UPDATE API endpoint
  const { trigger: updateTrigger } = useSWRMutation(technologyEndpoint.UPDATE, updateTechnology);
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
  const openEditModal = (categoryId: string, technologyName: string) => {
    setModalType('edit');
    setEditingCategoryId(categoryId);
    setCategoryName(technologyName);
  };
  // Handler function for update technology

  const handleUpdateTechnologyName = async () => {
    if (!editingCategoryId) return;
    try {
      await updateTrigger({ id: editingCategoryId, name: categoryName });
      toast.success('Technology updated successfully');
      mutate((key) => typeof key === 'string' && key.startsWith('/technology/list'));
      setModalType(null);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong.');
    }
  };

  const columns = useMemo<Array<Column<QuestionCategory>>>(
    () => [
      {
        key: 'name',
        header: 'Technology Name',
        render: (row) => (
          <div className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</div>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(row.id, row.name);
                  }}
                >
                  <SquarePen className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                <p>Edit Technology Name</p>
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
    <>
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
      {modalType !== null && (
        <CreateTechnologyModal
          title={
            modalType === 'edit' ? 'Edit Technology' : ''
            //  modalType === 'delete' ? (
            //     <div className="flex items-center gap-2 text-red-500">
            //       <IoIosWarning className="text-xl" />
            //       <span>Delete Technology</span>
            //     </div>
            //   ) : (
            //     ''
            //   )
          }
          onOpenChange={() => setModalType(null)}
          actionsAlign="center"
          actionButtons={
            modalType === 'edit' ? (
              <button
                className="bg-blue-500 text-white px-3 py-2 rounded"
                onClick={handleUpdateTechnologyName}
              >
                Save
              </button>
            ) : (
              ''
            )
            //  (
            //   <>
            //     <button
            //       onClick={() => setModalType(null)}
            //       className="bg-blue-500 text-white px-3 py-2 rounded"
            //     >
            //       Cancel
            //     </button>
            //     <button
            //       disabled={!isDeleteConfirmed}
            //       className={`px-3 py-2 rounded text-white transition-all
            //      ${isDeleteConfirmed ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'}
            //     `}
            //       onClick={() => handleDeleteTechnology(category.id)}
            //     >
            //       Delete
            //     </button>
            //   </>
            // )
          }
        >
          {
            modalType === 'edit' ? (
              <input
                type="text"
                className="w-96 px-4 py-5 h-10 border border-gray-300 rounded hover:outline-gray-400 focus:outline-none focus:border-gray-500"
                placeholder="Enter Technology Name..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            ) : (
              ' '
            )
            //   (
            //   <div className="flex flex-col gap-4 text-center">
            //     <p className="text-md text-gray-600">This will permanently delete this technology.</p>
            //     <p className="text-md font-semibold text-red-500">This action cannot be undone.</p>
            //     <div className="flex items-center justify-center gap-2 mt-2">
            //       <input
            //         type="checkbox"
            //         checked={isDeleteConfirmed}
            //         onChange={(e) => setIsDeleteConfirmed(e.target.checked)}
            //         className="h-4 w-4 cursor-pointer"
            //       />
            //       <span className="text-sm">I understand this action is permanent</span>
            //     </div>
            //   </div>
            // )
          }
        </CreateTechnologyModal>
      )}
    </>
  );
}
