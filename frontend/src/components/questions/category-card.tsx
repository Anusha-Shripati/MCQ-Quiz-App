"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryMenu from "./category-menu";
import { useRouter } from "next/navigation";
import { Eye, Plus } from "lucide-react";
import { Button } from "../ui/form/button";
// import Link from "next/link";
import { QuestionCategory } from "@/shared/types/app";

export const CategoryCard = ({
  category,
  handleDelete,
}: {
  category: QuestionCategory;
  handleDelete: (category: QuestionCategory) => void;
}) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/questions/category/${category.name}`);
  };

  const handleAddQuestion = () => {
    router.push(`/questions/create-question/${category.name}`);
  };

  const handleNavigateDifficulty = (
    event: React.MouseEvent,
    difficulty: string
  ) => {
    event.stopPropagation();
    router.push(
      `/questions/category/${category.name}?difficulty=${difficulty}`
    );
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row justify-between items-center border-b pb-2">
        <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
        <div className="flex items-center justify-center">
          {/* <Link href={`/questions/create-question/`}> */}
          <Button
            variant="outline"
            size="default"
            className="hover:bg-gray-600 mb-2"
            onClick={handleNavigate}
          >
            {/* <Plus className="h-4 w-4" /> Add */}
            <Eye className="h-4 w-4 text-blue-500" />
            View
          </Button>
          {/* </Link> */}
          {/* <CategoryMenu category={category} handleNavigate={handleNavigate} /> */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mt-2">
          <div className="flex justify-between items-center ">
            <div
              className="flex justify-center items-center gap-2 cursor-pointer"
              onClick={(event) => handleNavigateDifficulty(event, "easy")}
            >
              <span className="font-semibold text-green-600">●</span>
              <span className="font-medium">Easy</span>
            </div>
            <div>{category.easy}</div>
          </div>
          <div className="flex justify-between items-center">
            <div
              className="flex justify-center items-center gap-2 cursor-pointer"
              onClick={(event) => handleNavigateDifficulty(event, "medium")}
            >
              <span className="font-semibold text-orange-300">●</span>
              <span className="font-medium">Medium</span>
            </div>
            <div>{category.medium}</div>
          </div>
          <div className="flex justify-between items-center">
            <div
              className="flex justify-center items-center gap-2 cursor-pointer"
              onClick={(event) => handleNavigateDifficulty(event, "hard")}
            >
              <span className="font-semibold text-red-500">●</span>
              <span className="font-medium">Hard</span>
            </div>
            <div>{category.hard}</div>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-2">
            <span
              className="font-medium hover:cursor-pointer"
              onClick={handleNavigate}
            >
              Total
            </span>
            <span className="font-extrabold">
              {category.easy + category.medium + category.hard}
            </span>
          </div>
          <div className="flex items-center justify-between">
            {/* <Link href={`/questions/create-question/`}> */}
            <Button
              variant="outline"
              size="default"
              className="hover:bg-gray-600"
              onClick={handleAddQuestion}
            >
              <Plus className="h-4 w-4" /> Add Questions
            </Button>
            {/* <Button
            variant="outline"
            size="default"
            className="hover:bg-gray-600"
            onClick={handleAddQuestion}
          >
            <Plus className="h-4 w-4" /> View
          </Button> */}
            {/* </Link> */}
            <CategoryMenu
              category={category}
              // handleNavigate={handleNavigate}
              handleDelete={handleDelete}
            />
          </div>
        </div>
        {/* <CategoryActions category={category} /> */}
      </CardContent>
    </Card>
  );
};
