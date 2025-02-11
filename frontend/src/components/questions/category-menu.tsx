"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash, MoreVertical, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { QuestionCategory } from "@/shared/types/app";

const CategoryMenu = ({ category, handleNavigate }: { category: QuestionCategory, handleNavigate:()=>void }) => {
  const handleEditCategory = (categoryName: string) => {
    console.log(categoryName)
  };

  const handleDeleteCategory = (categoryName: string) => {
    console.log(categoryName)
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
        className="w-48 flex flex-col space-y-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md dark:shadow-lg">
        <DropdownMenuItem
          onClick={() => handleEditCategory(category.name)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDeleteCategory(category.name)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash className="h-4 w-4 text-red-500" />
          <span className="text-gray-900 dark:text-gray-200">Delete</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigate()}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Eye className="h-4 w-4 text-blue-500" />
          <span className="text-gray-900 dark:text-gray-200">View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryMenu;
