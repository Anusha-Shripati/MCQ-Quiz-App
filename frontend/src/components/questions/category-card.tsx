'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { EyeIcon, Plus } from 'lucide-react';
import { Button } from '../ui/form/button';
import { QuestionCategory } from '@/shared/types/app';
import { useAuthStore } from '@/store/authStore';
import { FaEdit } from 'react-icons/fa';
import useSWRMutation from 'swr/mutation';
import { technologyEndpoint } from '@/lib/endpoint';
import { api } from '@/lib/api';
import { mutate } from 'swr';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { AxiosError } from 'axios';
// import { MdDelete } from 'react-icons/md';
// import { IoIosWarning } from 'react-icons/io';
import CreateTechnologyModal from '../ui/create-technology-modal';
interface CreateCard {
  category: QuestionCategory;
}
type ModalType = 'add' | 'edit' | 'delete' | null;
//  SWR mutation fetcher for function deleting a technology.
// async function deleteTechnology(url: string) {
//   return await api.delete(url);
// }

//  SWR mutation fetcher for function editing a technology.
async function updateTechnology(url: string, { arg }: { arg: { name: string } }) {
  return await api.put(url, { name: arg.name });
}

async function getTechnologyById(url: string) {
  const res = await api.get(url);
  return res;
}

export const CategoryCard: React.FC<CreateCard> = ({
  category,
}: {
  category: QuestionCategory;
}) => {
  const router = useRouter();
  const [modalType, setModalType] = useState<ModalType>(null);
  // const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const { hasPermissionQuestionEdit } = useAuthStore();
  const isQuestionEditable = hasPermissionQuestionEdit();

  const handleNavigate = () => {
    router.push(`/questions/category/${category.id}`);
  };

  //  Deletes a technology by calling the DELETE API endpoint.
  // const { trigger } = useSWRMutation(
  //   `${technologyEndpoint.DELETE}/${category.id}`,
  //   deleteTechnology
  // );

  // Updates a technology by calling the UPDATE API endpoint
  const { trigger: updateTrigger } = useSWRMutation(
    technologyEndpoint.UPDATE.replace(':id', category.id),
    updateTechnology
  );
  const { trigger: getTechByIdTrigger } = useSWRMutation(
    `${technologyEndpoint.GET_TECHNOLOGY_BY_ID}/${category.id}`,
    getTechnologyById
  );
  const handleAddQuestion = () => {
    router.push(`/questions/create-question/${category.id}`);
  };

  const handleNavigateDifficulty = (event: React.MouseEvent, difficulty: string) => {
    event.stopPropagation();
    router.push(`/questions/category/${category.id}?difficulty_level=${difficulty}`);
  };
  // opens modal for delete and edit
  // const openDeleteModal = () => {
  //   setModalType('delete');
  //   setIsDeleteConfirmed(false);
  // };
  const openEditModal = () => {
    setModalType('edit');
    setCategoryName(category.name);
  };

  // Handler function for delete technology
  // const handleDeleteTechnology = async (id: string) => {
  //   try {
  //     await trigger();
  //     toast.success('Technology deleted successfully');
  //     mutate((key) => typeof key === 'string' && key.startsWith('/technology/list'));
  //     setModalType(null);
  //   } catch (error) {
  //     console.log('Error', error);
  //     toast.error('Failed to delete technology');
  //   }
  // };

  // Handler function for update technology
  const handleUpdateTechnologyName = async () => {
    try {
      await updateTrigger({ name: categoryName });
      toast.success('Technology updated successfully');
      mutate((key) => typeof key === 'string' && key.startsWith('/technology/list'));
      setModalType(null);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong.');
    }
  };

  //  Handler function for  Fetch Technology By Id

  const handleFetchTechnologyById = async (id: string) => {
    try {
      await getTechByIdTrigger();
      console.log('Technology ID: ', id);
    } catch (error) {
      console.log('Fetch-Technology by ID error', error);
    }
  };
  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row justify-between items-center flex-wrap  border-b py-3 px-5 gap-1">
          <CardTitle
            className="text-lg font-semibold"
            onClick={() => handleFetchTechnologyById(category.id)}
          >
            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
          </CardTitle>
          <div className="flex gap-2 flex-wrap lg:flex-grow-0 flex-grow">
            <FaEdit className="h-5 w-5 mt-1 cursor-pointer" onClick={openEditModal} />
            {/* <MdDelete className="h-5 w-5 mt-1 cursor-pointer" onClick={openDeleteModal} /> */}
            {isQuestionEditable && (
              <div className="flex items-center xl:flex-grow-0 flex-grow justify-center gap-2">
                <Button
                  variant="outline"
                  size="default"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 w-full"
                  onClick={() => handleAddQuestion()}
                >
                  <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />{' '}
                  <span className="text-gray-900 dark:text-gray-200">Add Questions</span>
                </Button>
              </div>
            )}
            <div className="flex items-center justify-center xl:flex-grow-0 flex-grow">
              <Button
                variant="outline"
                onClick={() => handleNavigate()}
                className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 w-full"
              >
                <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-900 dark:text-gray-200">View all</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between items-center ">
              <div
                className="flex justify-center items-center gap-2 cursor-pointer"
                onClick={(event) => handleNavigateDifficulty(event, 'easy')}
              >
                <span className="font-semibold text-green-600">●</span>
                <span className="font-medium">Easy</span>
              </div>
              <div>{category.difficultyCount.easy}</div>
            </div>
            <div className="flex justify-between items-center">
              <div
                className="flex justify-center items-center gap-2 cursor-pointer"
                onClick={(event) => handleNavigateDifficulty(event, 'medium')}
              >
                <span className="font-semibold text-orange-300">●</span>
                <span className="font-medium">Medium</span>
              </div>
              <div>{category.difficultyCount.medium}</div>
            </div>
            <div className="flex justify-between items-center">
              <div
                className="flex justify-center items-center gap-2 cursor-pointer"
                onClick={(event) => handleNavigateDifficulty(event, 'hard')}
              >
                <span className="font-semibold text-red-500">●</span>
                <span className="font-medium">Hard</span>
              </div>
              <div>{category.difficultyCount.hard}</div>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <span className="font-medium hover:cursor-pointer" onClick={handleNavigate}>
                Total
              </span>
              <span className="font-extrabold">
                {category.difficultyCount.easy +
                  category.difficultyCount.medium +
                  category.difficultyCount.hard}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
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
                onClick={() => handleUpdateTechnologyName()}
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
};
