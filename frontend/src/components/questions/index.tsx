'use client';
import { CategoryCard } from '@/components/questions/category-card';
import CreateCategory from '@/components/questions/create-category';
import { useEffect, useState } from 'react';
import { QuestionCategory } from '@/shared/types/app';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useQuestionStore } from '@/store/questionStore';
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
import StatusWrapper from '@/components/common/status-wrapper';
import { useAuthStore } from '@/store/authStore';
import { technologyEndpoint } from '@/lib/endpoint';

export default function QuestionsPage() {
  const [categoriesArray, setCategoriesArray] = useState<QuestionCategory[]>([]);
  const { technologyFilter } = useQuestionStore();
  const { paramsLoading } = useAuthStore();
  const { data, isLoading, error ,mutate:questionMutate,isValidating } = useSWR(paramsLoading ? null : `${technologyEndpoint.LIST}?search=${technologyFilter}`, api.get);
  useEffect(() => {
    if (data) {
      setCategoriesArray(data.data.list);
    }
  }, [data]);

  return (
    <div className="px-2 py-6 flex flex-col">
      <div className="flex items-center justify-end mb-6">
        <CreateCategory categoriesArray={categoriesArray} />

      </div>
      <StatusWrapper className="w-full min-h-[600px]" loading={isLoading || isValidating} error={error}  reset={questionMutate}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {categoriesArray.length > 0 ? (
            categoriesArray.map((list: QuestionCategory) => (
              <CategoryCard key={list.id} category={list}  />
            ))
          ) : (
            <div className="col-span-full min-h-[80vh] flex items-center justify-center">
              <div className="text-muted-foreground">
                No technology found. Please create a new technology.
              </div>
            </div>
          )}
        </div>
      </StatusWrapper>
    </div>
  );
}

