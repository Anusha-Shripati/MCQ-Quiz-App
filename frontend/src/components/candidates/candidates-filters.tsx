'use client';
import { cn } from '@/lib/utils';
import { AssessmentOption, CandidateFilter, TechnologyOption } from '@/types/candidate.types';
import { useEffect, useMemo, useRef } from 'react';
import { Button } from '../ui/form/button';
import { AssessmentFilter } from './filters/assessment-filter';
import { FilterOptions } from './filters/filter-options';
import { SearchFilter } from './filters/search-filter';
import { TechnologyFilter } from './filters/technology-filter';
import { api } from '@/lib/api';
import { useCandidateStore } from '@/store/candidateStore';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { assessmentEndpoint, technologyEndpoint } from '@/lib/endpoint';
import useDebounce from '@/hooks/useDebounce';
import { isEqual } from 'lodash';
import CreateCandidateDialog from './create-candidate-dialog';
import { useAuthStore } from '@/store/authStore';

const Filters = () => {
  const { data: assessments } = useSWR(assessmentEndpoint.ALL, api.get, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    staleWhileRevalidate: true,
  });
  const { data: technology } = useSWR(technologyEndpoint.LIST, api.get, {
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
    candidateFilter,
  } = useCandidateStore();
  const {hasPermissionCandidateEdit} = useAuthStore();
  const canCreateCandidate = hasPermissionCandidateEdit();
  // Keep track of whether the form is being updated from external source
  const isExternalUpdate = useRef(false);
  // Keep track of previous filter values for comparison

  const prevFilterRef = useRef<CandidateFilter | null>(null);

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
  const debouncedFormData = useDebounce(formData, 500);

  const getData = () => {
    // Only proceed if this isn't an external update
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

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
          days: formData.created?.days,
          range: {
            from: formData.created.range.from
              ? (() => {
                const fromDate = new Date(formData.created.range.from!);
                fromDate.setHours(0, 0, 0, 0);
                return fromDate;
              })()
              : undefined,
            to: formData.created.range.to
              ? (() => {
                const toDate = new Date(formData.created.range.to as string | number | Date);
                toDate.setHours(23, 59, 59, 999);
                return toDate;
              })()
              : undefined,
          },
        }
        : undefined,
    };

    // Skip update if payload is the same as previous
    if (prevFilterRef.current && isEqual(prevFilterRef.current, payload)) {
      return;
    }

    prevFilterRef.current = payload;
    setCandidateFilter(payload);
  };


  useEffect(() => {
    getData();
  }, [debouncedFormData]);

  const clearAllFilters = () => {
    prevFilterRef.current = defaultValues;
    reset(defaultValues);
    setCandidateFilter(defaultValues);
  };

  useEffect(() => {
    // Skip if values are the same to prevent loop
    const newFormData = {
      searchQuery: candidateFilter.searchQuery || '',
      technologyFilter: candidateFilter.technologyFilter || [],
      assessmentFilter: candidateFilter.assessmentFilter || [],
      created: {
        days: candidateFilter.created?.days || '',
        range: candidateFilter.created?.range || undefined,
      },
    };

    // Only reset if values are different
    if (!isEqual(newFormData, formData)) {
      isExternalUpdate.current = true;
      reset(newFormData);
    }
  }, [candidateFilter]);

  const isFilter = useMemo(() => {
    return Object.keys(formData).some((key: string) => {
      const typedKey = key as keyof CandidateFilter;

      if (typedKey === 'technologyFilter' || typedKey === 'assessmentFilter') {
        return formData[typedKey].length > 0;
      } else if (typedKey === 'created') {
        return formData[typedKey]?.days !== '' || formData[typedKey]?.range !== undefined;
      } else {
        return formData[typedKey] !== '';
      }
    });
  }, [formData]);

  return (
    <section className="w-full">
      <div className="flex flex-col justify-end md:flex-row md:items-center gap-2 flex-wrap mb-2">
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

        <FilterOptions formData={formData} setValue={setValue} register={register} />
        <div className="flex justify-end items-center gap-4 flex-wrap ml-2">
          {isFilter && (
            <Button
              variant="destructive"
              onClick={clearAllFilters}
              className={cn(
                'h-10 px-4 text-sm font-medium whitespace-nowrap',
                'bg-red-400 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
                'focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              )}
            >
              Clear All
            </Button>
          )}
        </div>
        {canCreateCandidate && (
          <CreateCandidateDialog />
        )}
      </div>
    </section>
  );
};

Filters.displayName = 'Filters';
export default Filters;
