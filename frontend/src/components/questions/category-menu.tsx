"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash, MoreVertical, Eye } from "lucide-react";
import { Button } from "../ui/button";

const CategoryMenu = ({ category, handleNavigate }: { category: QuestionCategory, handleNavigate:()=>void }) => {
  const handleEditCategory = (categoryName: string) => {
    console.log("Edit category", categoryName);
  };

  const handleDeleteCategory = (categoryName: string) => {
    console.log("Delete category", categoryName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-48 flex flex-col space-y-1 p-2 bg-white rounded-md shadow">
        <DropdownMenuItem
          onClick={() => handleEditCategory(category.name)}
          className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md"
        >
          <Edit className="h-4 w-4" />
          <span>Edit </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDeleteCategory(category.name)}
          className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md"
        >
          <Trash className="h-4 w-4 text-red-500" />
          <span>Delete </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigate()}
          className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md"
        >
          <Eye className="h-4 w-4 text-blue-500" />
          <span>View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryMenu;
