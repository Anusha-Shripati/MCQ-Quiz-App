"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryMenu from "./category-menu";
import CategoryActions from "./category-actions";
import { useRouter } from 'next/navigation';

export const CategoryCard = ({ category }: { category: QuestionCategory }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/questions/category/${category?.name}`); // Navigate to the desired route
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200" onClick={handleNavigate}>
      <CardHeader className="flex flex-row justify-between items-center border-b pb-2">
        <CardTitle className="text-lg font-semibold">
          {category.name}
        </CardTitle>
        <CategoryMenu category={category} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mt-2">
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2">
              <span className="font-semibold text-green-600">●</span>
              <span className="font-medium">Easy</span>
            </div>
            <div>{category.easy}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2">
              <span className="font-semibold text-orange-300">●</span>
              <span className="font-medium">Medium</span>
            </div>
            <div>{category.medium}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2">
              <span className="font-semibold text-red-500">●</span>
              <span className="font-medium">Hard</span>
            </div>
            <div>{category.hard}</div>
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-2">
            <span className="font-medium">Total</span>
            <span className="font-extrabold">
              {category.easy + category.medium + category.hard}
            </span>
          </div>
        </div>
        <CategoryActions category={category} />
      </CardContent>
    </Card>
  );
};

