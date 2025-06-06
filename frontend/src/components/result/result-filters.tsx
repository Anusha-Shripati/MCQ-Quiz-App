'use client';
import { cn } from '@/lib/utils';
import { StatusOption } from '@/types/common.types';
import { useEffect, useMemo, useRef } from 'react';
import { Button } from '../ui/form/button';
import { AssessmentFilter } from '../candidates/filters/assessment-filter';
import { SearchFilter } from '../candidates/filters/search-filter';
import { TechnologyFilter } from '../candidates/filters/technology-filter';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { useResultStore } from '@/store/resultStore';
import { ResultFilter } from '@/types/exam.types';
import { PercentageFilter } from './percentage-options';
import { assessmentEndpoint, technologyEndpoint } from '@/lib/endpoint';
import useDebounce from '@/hooks/useDebounce';
import { isEqual } from 'lodash';

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
    setResultFilter,
    setAssessmentOptions,
    setTechnologyOptions,
    assessmentOptions,
    technologyOptions,
    resultFilter,
  } = useResultStore();

  // Keep track of whether the form is being updated from external source
  const isExternalUpdate = useRef(false);
  // Keep track of previous filter values for comparison
  const prevFilterRef = useRef<ResultFilter | null>(null);

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

  const defaultValues: ResultFilter = {
    search: '',
    assessmentFilter: [],
    technologyFilter: [],
    startDate: undefined,
    endDate: undefined,
    percentageFrom: null,
    percentageTo: null,
    experienceFrom: null,
    experienceTo: null,
    days: ""
  }

  const { setValue, watch, reset, setError, formState: { errors }, clearErrors } = useForm<ResultFilter>({
    defaultValues,
  });

  const formData = watch();
  const debouncedFormData = useDebounce(formData, 500);

  const applyFilters = () => {
    // Only proceed if this isn't an external update
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    // Validate inputs before applying
    if (
      (formData.percentageFrom !== null && (Number(formData.percentageFrom) < 0 || Number(formData.percentageFrom) > 100)) ||
      (formData.percentageTo !== null && (Number(formData.percentageTo) < 0 || Number(formData.percentageTo) > 100))
    ) {
      if (formData.percentageFrom !== null && (Number(formData.percentageFrom) < 0 || Number(formData.percentageFrom) > 100)) {
        setError('percentageFrom', { message: 'Must be 0-100' });
      }
      if (formData.percentageTo !== null && (Number(formData.percentageTo) < 0 || Number(formData.percentageTo) > 100)) {
        setError('percentageTo', { message: 'Must be 0-100' });
      }
      return;
    }

    // Clear any errors before applying filters
    clearErrors();

    const payload: ResultFilter = {
      search: formData.search || '',
      technologyFilter: (formData.technologyFilter || []).map((item: StatusOption) => ({
        value: item.value,
        label: item.label,
      })),
      assessmentFilter: (formData.assessmentFilter || []).map((item: StatusOption) => ({
        value: item.value,
        label: item.label,
      })),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      percentageFrom: formData.percentageFrom !== null ? Number(formData.percentageFrom) : null,
      percentageTo: formData.percentageTo !== null ? Number(formData.percentageTo) : null,
      experienceFrom: formData.experienceFrom !== null ? Number(formData.experienceFrom) : null,
      experienceTo: formData.experienceTo !== null ? Number(formData.experienceTo) : null,
      days: formData.days,
    };

    // Skip update if payload is the same as previous
    if (prevFilterRef.current && isEqual(prevFilterRef.current, payload)) {
      return;
    }

    prevFilterRef.current = payload;
    setResultFilter(payload);
  };

  // Apply filters automatically when debounced form data changes
  useEffect(() => {
    applyFilters();
  }, [debouncedFormData]);

  const clearAllFilters = () => {
    prevFilterRef.current = defaultValues;
    reset(defaultValues);
    setResultFilter(defaultValues);
  };

  useEffect(() => {
    // Skip if values are the same to prevent loop
    const newFormData = {
      search: resultFilter.search || '',
      assessmentFilter: resultFilter.assessmentFilter || [],
      technologyFilter: resultFilter.technologyFilter || [],
      startDate: resultFilter.startDate || undefined,
      endDate: resultFilter.endDate || undefined,
      percentageFrom: resultFilter.percentageFrom !== null ? Number(resultFilter.percentageFrom) : null,
      percentageTo: resultFilter.percentageTo !== null ? Number(resultFilter.percentageTo) : null,
      experienceFrom: resultFilter.experienceFrom !== null ? Number(resultFilter.experienceFrom) : null,
      experienceTo: resultFilter.experienceTo !== null ? Number(resultFilter.experienceTo) : null,
      days: resultFilter.days || ""
    };

    // Only reset if values are different
    if (!isEqual(newFormData, formData)) {
      isExternalUpdate.current = true;
      reset(newFormData);
    }
  }, [resultFilter]);

  const isFilter = useMemo(() => {
    return Object.keys(formData).some((key: string) => {
      const typedKey = key as keyof ResultFilter;

      if (typedKey === 'technologyFilter' || typedKey === 'assessmentFilter') {
        return formData[typedKey].length > 0;
      } else {
        return formData[typedKey] !== '' && formData[typedKey] !== undefined && formData[typedKey] !== null;
      }
    });
  }, [formData]);

  return (
    <section className="w-full">
      <div className="flex flex-col md:flex-row md:items-start gap-2 flex-wrap mb-2">
        <SearchFilter
          searchQuery={formData.search}
          setSearchQuery={(value) => setValue('search', value)}
        />

        <TechnologyFilter
          value={formData.technologyFilter}
          onChange={(value: StatusOption[]) => {
            setValue('technologyFilter', value);
          }}
          options={technologyOptions}
        />

        <AssessmentFilter
          value={formData.assessmentFilter}
          onChange={(value: StatusOption[]) => setValue('assessmentFilter', value)}
          options={assessmentOptions}
        />

        <div className='flex flex-col w-40'>
          <PercentageFilter
            filterName='Percentage'
            formData={formData}
            setValue={setValue}
            errors={errors}
            setError={setError}
            clearErrors={clearErrors}
          />
          {
            errors?.percentageFrom && <p className='text-red-500 text-sm'>{errors.percentageFrom.message}</p>
          }
          {
            errors?.percentageTo && <p className='text-red-500 text-sm'>{errors.percentageTo.message}</p>
          }
        </div>

        <div className='flex flex-col w-40'>
          <PercentageFilter
            filterName='Experience'
            formData={formData}
            setValue={setValue}
            errors={errors}
            setError={setError}
            clearErrors={clearErrors}
          />
          {
            errors?.experienceFrom && <p className='text-red-500 text-sm'>{errors.experienceFrom.message}</p>
          }
          {
            errors?.experienceTo && <p className='text-red-500 text-sm'>{errors.experienceTo.message}</p>
          }
        </div>

        <PercentageFilter
          filterName='Exam Date'
          formData={formData}
          setValue={setValue}
        />
        <div className="flex justify-end items-center gap-4 flex-wrap mt-1 ml-2">
          {isFilter && (
            <Button
              variant="destructive"
              onClick={clearAllFilters}
              className={cn(
                'h-10 px-4 text-sm font-medium whitespace-nowrap',
                'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
                'focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              )}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

    </section>
  );
};

Filters.displayName = 'Filters';
export default Filters;
