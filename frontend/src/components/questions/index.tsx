'use client';
import TechnologyTable from '@/components/questions/technology-table';
import TechnologyFilters from '@/components/questions/technology-filters';
import { useEffect, useState } from 'react';
import { QuestionCategory } from '@/shared/types/app';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useQuestionStore } from '@/store/questionStore';
import StatusWrapper from '@/components/common/status-wrapper';
import { useAuthStore } from '@/store/authStore';
import { technologyEndpoint } from '@/lib/endpoint';
import { Card } from '@/components/ui/card';
import { usePathname } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce';

export default function QuestionsPage() {
  const [categoriesArray, setCategoriesArray] = useState<QuestionCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { setTechnologyFilter } = useQuestionStore();
  const { paramsLoading } = useAuthStore();
  const pathname = usePathname();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading,
    error,
    mutate: questionMutate,
    isValidating,
  } = useSWR(
    paramsLoading ? null : `${technologyEndpoint.LIST}?search=${debouncedSearchTerm}`,
    api.get
  );

  useEffect(() => {
    if (data) {
      setCategoriesArray(data.data.list);
    }
  }, [data]);

  useEffect(() => {
    const params = new URLSearchParams();
    setTechnologyFilter(debouncedSearchTerm);
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    }
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, setTechnologyFilter, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
      setTechnologyFilter(search);
    }
  }, [setTechnologyFilter]);

  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2">
        <TechnologyFilters
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          categoriesArray={categoriesArray}
        />
        <StatusWrapper
          className="min-h-[83vh] flex"
          loading={isLoading || isValidating}
          error={error}
          reset={questionMutate}
        >
          <TechnologyTable technologies={categoriesArray} />
        </StatusWrapper>
      </Card>
    </div>
  );
}
