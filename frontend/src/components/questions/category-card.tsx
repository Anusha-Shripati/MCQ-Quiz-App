'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryMenu from './category-menu';
import { useRouter } from 'next/navigation';
import { EyeIcon, Plus } from 'lucide-react';
import { Button } from '../ui/form/button';
import { QuestionCategory } from '@/shared/types/app';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { Permission } from '@/types/common.types';

export const CategoryCard = ({
  category,
  handleDelete,
}: {
  category: QuestionCategory;
  handleDelete: (id: string) => void;
}) => {
  const router = useRouter();
  const {user} = useAuthStore();
  const [isQuestionEditable, setIsQuestionEditable] = useState(false);

  const handleNavigate = () => {
    router.push(`/questions/category/${category.id}`);
  };

  const handleAddQuestion = () => {
    router.push(`/questions/create-question/${category.id}`);
  };

  const handleNavigateDifficulty = (event: React.MouseEvent, difficulty: string) => {
    event.stopPropagation();
    router.push(`/questions/category/${category.id}?difficulty=${difficulty}`);
  };

  useEffect(() => {
    const permissions = Array.isArray(user?.role?.role_permissions)
      ? (user.role.role_permissions as Permission[])
      : [];
    if (permissions.length > 0) {
      const canQuestionEdit = permissions.some(
        (permission) => permission.module?.name === 'questions' && permission.can_edit === true
      );
      setIsQuestionEditable(canQuestionEdit);
    }
    }, [user?.role]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row justify-between items-center border-b pb-2">
        <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
        {isQuestionEditable ? (
        <div className="flex items-center justify-center gap-2">
          <Button
              variant="outline"
              size="default"
              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              onClick={handleAddQuestion}
            >
              <Plus className="h-4 w-4" /> Add Questions
            </Button>
            <CategoryMenu
              category={category}
              handleDelete={handleDelete}
              handleNavigate={handleNavigate}
            />
        </div>
        ):(
          <div className='flex items-center justify-center'>
          <Button
          variant="outline"
          onClick={() => handleNavigate()}
          className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-gray-200">View</span>
            </Button>
           </div>
        )}
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
  );
};
