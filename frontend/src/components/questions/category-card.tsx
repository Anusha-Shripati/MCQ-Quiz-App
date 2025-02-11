"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryMenu from "./category-menu";
import { useRouter } from 'next/navigation';
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { QuestionCategory } from "@/shared/types/app";

export const CategoryCard = ({ category }: { category: QuestionCategory }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/questions/category/${category.name}`); // Navigate to the desired route
  };

  const handleNavigateDifficulty = (event: React.MouseEvent, difficulty: string) => {
    event.stopPropagation(); // Prevent card click from firing
    router.push(`/questions/category/${category.name}?difficulty=${difficulty}`);
  };

  // const handleAddQuestions = (event: React.MouseEvent) => {
  //   event.stopPropagation(); // Prevent card click from firing
  //   console.log("Add Questions");
  // };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200 " >
      <CardHeader className="flex flex-row justify-between items-center border-b pb-2">
        <CardTitle className="text-lg font-semibold">
          {category.name}
        </CardTitle>
        <div className="flex items-center justify-center ">
        <Link href={`/questions/create-question`}  >
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-secondary/80"
          
        >
          <Plus className="h-4 w-4"/> Add
        </Button>
        </Link>
        <CategoryMenu category={category} handleNavigate={handleNavigate}/>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mt-2">
          <div className="flex justify-between items-center " >
            <div className="flex justify-center items-center gap-2 cursor-pointer" onClick={(event) => handleNavigateDifficulty(event, "easy")}>
              <span className="font-semibold text-green-600">●</span>
              <span className="font-medium">Easy</span>
            </div>
            <div>{category.easy}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2 cursor-pointer" onClick={(event) => handleNavigateDifficulty(event, "medium")}>
              <span className="font-semibold text-orange-300">●</span>
              <span className="font-medium">Medium</span>
            </div>
            <div>{category.medium}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2 cursor-pointer" onClick={(event) => handleNavigateDifficulty(event, "hard")}>
              <span className="font-semibold text-red-500">●</span>
              <span className="font-medium">Hard</span>
            </div>
            <div>{category.hard}</div>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-2" >
            <span className="font-medium hover:cursor-pointer" onClick={handleNavigate}>Total</span>
            <span className="font-extrabold">
              {category.easy + category.medium + category.hard}
            </span>
          </div>
        </div>
        {/* <CategoryActions category={category} /> */}
      </CardContent>
    </Card>
  );
};

