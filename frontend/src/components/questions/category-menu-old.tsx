// "use client";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal, Edit, Trash } from "lucide-react";
// import { Button } from "../ui/button";

// const CategoryMenu = ({ category }: { category: QuestionCategory }) => {
//   const handleEditCategory = (categoryName: string) => {
//     console.log("Edit category", categoryName);
//   };

//   const handleDeleteCategory = (categoryName: string) => {
//     console.log("Delete category", categoryName);
//   };
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="icon">
//           <MoreHorizontal className="h-5 w-5 text-gray-500" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent>
//         <DropdownMenuItem onClick={() => handleEditCategory(category.name)}>
//           <Edit className="h-4 w-4 mr-2" /> Edit Category
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => handleDeleteCategory(category.name)}>
//           <Trash className="h-4 w-4 mr-2 text-red-500" /> Delete Category
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// export default CategoryMenu;

