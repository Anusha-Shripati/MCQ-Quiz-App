"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  // DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Trash, MoreVertical } from "lucide-react";
import { Button } from "../ui/form/button";
import { QuestionCategory } from "@/shared/types/app";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

async function deleteCategory(url: string) {
  const response = await api.delete(url);
  return response.data;
}
const CategoryMenu = ({
  category,
  handleDelete,
}: {
  category: QuestionCategory;
  handleDelete: (id: string) => void;
}) => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditCategory = (category: string) => {
    router.push(`/questions/create-question/${category}`);
    console.log(category);
  };

  // const handleDeleteCategory = (category: QuestionCategory) => {
  //   console.log(category);
  // };
  const { trigger } = useSWRMutation(`/technology/${category.id}`,deleteCategory);
  const handleDeleteCategory = async () => {
    try {
      await trigger();
      handleDelete(category.id);
    }catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Something went wrong.");
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48 flex flex-col space-y-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md dark:shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => handleEditCategory(category.id)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash className="h-4 w-4 text-red-500" />
          <span className="text-gray-900 dark:text-gray-200">Delete</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          onClick={() => handleNavigate()}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Eye className="h-4 w-4 text-blue-500" />
          <span className="text-gray-900 dark:text-gray-200">View</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the
              category.
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
                handleDeleteCategory();
                setIsDeleteModalOpen(false); // Close the modal
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};

export default CategoryMenu;
