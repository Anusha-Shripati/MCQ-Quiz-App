'use client';

import { Button } from '@/components/ui/form/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { DateRange, User } from '@/types/common.types';
import { AssessmentFilters, useAssessmentStore } from '@/store/assessmentStore';
import DatePickerWithRange from '../ui/form/date-range-picker';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FormField } from '../common/form-field';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { cn } from '@/lib/utils';
import { userEndpoint } from '@/lib/endpoint';
import useDebounce from '@/hooks/useDebounce';
import { isEqual } from 'lodash';
import { useAuthStore } from '@/store/authStore';

export default function AssessmentHeader() {
  const defaultValues = useMemo<AssessmentFilters>(
    () => ({
      name: '',
      created_by: 'all',
      created_duation: undefined,
      view: '',
    }),
    []
  );

  const { data: users } = useSWR(userEndpoint.LIST, fetcher);
  const { setFilters, filters } = useAssessmentStore();
  const { hasPermissionAssessmentEdit } = useAuthStore();
  const isAssessmentEditable = hasPermissionAssessmentEdit();
  const { control, setValue, watch, register, reset } = useForm<AssessmentFilters>({
    defaultValues,
  });

  // Keep track of whether the form is being updated from external source
  const isExternalUpdate = useRef(false);
  // Keep track of previous filter values for comparison
  const prevFilterRef = useRef<AssessmentFilters | null>(null);

  useEffect(() => {
    // Skip if values are the same to prevent loop
    if (!isEqual(filters, watch())) {
      isExternalUpdate.current = true;
      reset({
        name: filters.name || '',
        created_by: filters.created_by || 'all',
        created_duation: filters.created_duation || undefined,
        view: filters.view || '',
      });
    }
  }, [filters, reset, watch]);

  // Use specific watch fields instead of watching everything
  const name = watch('name');
  const created_by = watch('created_by');
  const created_duration = watch('created_duation');
  const view = watch('view');

  const allFields = useMemo(
    () => ({
      name,
      created_by,
      created_duation: created_duration,
      view,
    }),
    [name, created_by, created_duration, view]
  );

  const debouncedFields = useDebounce(allFields, 800);

  const headerUsersOptions = useMemo(() => {
    if (users) {
      return [
        { label: 'All', value: 'all' },
        ...users.data.list.map((user: User) => ({
          label: user.name,
          value: user.id,
        })),
      ];
    }
    return [];
  }, [users]);

  const handleViewChange = (view: string) => {
    if (view == 'today')
      setValue('created_duation', {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(new Date().setHours(23, 59, 59, 999)),
      });
    else if (view == 'week')
      setValue('created_duation', {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      });
    setValue('view', view);
  };

  const handleDateChange = (date: DateRange | undefined) => {
    if (date) {
      handleViewChange('calendar');
      setValue('created_duation', date);
    }
  };

  // Automatically apply filters when debounced fields change
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    // Skip update if payload is the same as previous
    if (prevFilterRef.current && isEqual(prevFilterRef.current, debouncedFields)) {
      return;
    }

    prevFilterRef.current = debouncedFields;
    setFilters(debouncedFields);
  }, [debouncedFields, setFilters]);

  const isFilter = useMemo(() => {
    return (
      (name && name !== '') ||
      created_by !== 'all' ||
      created_duration?.from !== undefined ||
      created_duration?.to !== undefined ||
      (view && view !== '')
    );
  }, [name, created_by, created_duration, view]);

  const clearAllFilters = useCallback(() => {
    prevFilterRef.current = defaultValues;
    reset(defaultValues);
    setFilters(defaultValues);
  }, [defaultValues, reset, setFilters]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left side - Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <FormField
          className="bg-white dark:bg-primary border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white focus:border-transparent text-gray-900 dark:text-gray-300 min-w-[200px] h-10"
          type="search"
          value={allFields.name}
          placeholder="Search by name"
          {...register('name')}
        />
        <Controller
          name="created_by"
          control={control}
          render={({ field }) => (
            <FormField
              className="bg-white dark:bg-primary border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-gray-300 min-w-[200px] h-10"
              type="select"
              onChange={field.onChange}
              value={field.value}
              placeholder="Created by"
              options={headerUsersOptions}
            />
          )}
        />
        {/* View Mode Buttons */}
        <div className="flex bg-white dark:bg-primary rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
          <Button
            variant={allFields.view === 'today' ? 'secondary' : 'ghost'}
            size="sm"
            className={`${allFields.view === 'today' ? 'bg-gray-100 dark:bg-secondary' : ''
              } text-gray-900 dark:text-gray-300`}
            onClick={() => handleViewChange('today')}
          >
            Today
          </Button>
          <Button
            variant={allFields.view === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            className={`${allFields.view === 'week' ? 'bg-gray-100 dark:bg-secondary' : ''
              } text-gray-900 dark:text-gray-300`}
            onClick={() => handleViewChange('week')}
          >
            Week
          </Button>
          <DatePickerWithRange selected={allFields.created_duation} onSelect={handleDateChange} />
        </div>
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

      {/* Right side - Create Assessment Button */}
      {isAssessmentEditable && (
        <Link href="/assessments/create-assessment">
          <Button className="bg-foreground text-secondary hover:bg-foreground/90 shadow-sm">
            <PlusCircle className=" h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      )}
    </div>
  );
}
