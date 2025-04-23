'use client';
import { cn } from '@/lib/utils';
import { AssessmentOption, CandidateFilter, TechnologyOption } from '@/types/candidate.types';
import { useEffect, useMemo } from 'react';
import { Button } from '../ui/form/button';
import { AssessmentFilter } from './filters/assessment-filter';
import { FilterOptions } from './filters/filter-options';
import { SearchFilter } from './filters/search-filter';
import { TechnologyFilter } from './filters/technology-filter';
import { api } from '@/lib/api';
import { useCandidateStore } from '@/store/candidateStore';
import { ListFilterIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';

const Filters = () => {
  const { data: assessments } = useSWR('/assessment/all', api.get, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    staleWhileRevalidate: true,
  });
  const { data: technology } = useSWR('/technology/list', api.get, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    staleWhileRevalidate: true,
  });

  const {
    setCandidateFilter,
    setAssessmentOptions,
    setTechnologyOptions,
    assessmentOptions,
    technologyOptions,
  } = useCandidateStore();

  useEffect(() => {
    const assessmentOptions =
      assessments?.data?.map(
        (item: { id: string; name: string; technologies: { id: string; name: string }[] }) => ({
          value: item.id,
          label: item.name,
          technologies: item.technologies,
        })
      ) || [];

    setAssessmentOptions(assessmentOptions);
  }, [assessments]);

  useEffect(() => {
    const technologyData =
      technology?.data?.list?.map((item: { id: string; name: string }) => ({
        value: item.id,
        label: item.name,
      })) || [];
    setTechnologyOptions(technologyData);
  }, [technology]);

  const defaultValues: CandidateFilter = {
    searchQuery: '',
    technologyFilter: [],
    assessmentFilter: [],
    created: {
      days: '',
      range: undefined,
    },
  };
  const { setValue, watch, reset, register } = useForm<CandidateFilter>({
    defaultValues,
  });

  const formData = watch();

  const getData = () => {
    const payload: CandidateFilter = {
      searchQuery: formData.searchQuery || '',
      technologyFilter: (formData.technologyFilter || []).map((item: TechnologyOption) => ({
        value: item.value,
        label: item.label,
      })),
      assessmentFilter: (formData.assessmentFilter || []).map((item: AssessmentOption) => ({
        value: item.value,
        label: item.label,
      })),
      created: formData.created?.range
        ? {
            days: '',
            range: {
              from: formData.created.range.from
                ? new Date(formData.created.range.from.setHours(0, 0, 0, 0))
                : undefined,
              to: formData.created.range.to
                ? new Date(formData.created.range.to.setHours(23, 59, 59, 999))
                : undefined,
            },
          }
        : undefined,
    };
    setCandidateFilter(payload);
  };

  const clearAllFilters = () => {
    reset();
  };

  const isFilter = useMemo(() => {
    return Object.keys(watch()).some((key: string) => {
      const typedKey = key as keyof CandidateFilter;
      if (typedKey === 'technologyFilter' || typedKey === 'assessmentFilter') {
        return watch(typedKey).length > 0;
      } else if (typedKey === 'created') {
        return watch(typedKey)?.days !== '' || watch(typedKey)?.range !== undefined;
      } else {
        return watch(typedKey) !== '';
      }
    });
  }, [watch]);

  return (
    <section className="w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap mb-2">
        <SearchFilter
          searchQuery={formData.searchQuery}
          setSearchQuery={(value) => setValue('searchQuery', value)}
        />

        <TechnologyFilter
          value={formData.technologyFilter}
          onChange={(value: TechnologyOption[]) => {
            setValue('technologyFilter', value);
          }}
          options={technologyOptions}
        />

        <AssessmentFilter
          value={formData.assessmentFilter}
          onChange={(value: AssessmentOption[]) => setValue('assessmentFilter', value)}
          options={assessmentOptions}
        />

        <FilterOptions formData={watch()} setValue={setValue} register={register} />
        <Button className="ml-2 cursor-pointer" onClick={getData}>
          <ListFilterIcon size={30} />
        </Button>
      </div>
      <div className="flex justify-end items-center gap-4 flex-wrap mt-2 ml-2">
        {isFilter && (
          <Button
            variant="destructive"
            onClick={clearAllFilters}
            className={cn(
              'h-11 px-4 text-sm font-medium whitespace-nowrap',
              'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
              'focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
            )}
          >
            Clear All
          </Button>
        )}
      </div>
    </section>
  );
};

Filters.displayName = 'Filters';
export default Filters;
