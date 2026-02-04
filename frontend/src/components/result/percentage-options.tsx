import { Button } from '@/components/ui/form/button';
import DateRangePicker from '../ui/form/date-range-picker';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { FieldErrors, UseFormClearErrors, UseFormSetError, UseFormSetValue } from 'react-hook-form';
import { useMemo, useState, useCallback } from 'react';
import { DateRange } from '@/types/common.types';
import { ResultFilter } from '@/types/exam.types';
import { Input } from '../ui/form/input';

interface FilterOptionsProps {
  formData: ResultFilter;
  setValue: UseFormSetValue<ResultFilter>;
  filterName: string;
  errors?: FieldErrors<ResultFilter>
  setError?: UseFormSetError<ResultFilter>
  clearErrors?: UseFormClearErrors<ResultFilter>
}
type MinType = 'percentageFrom' | 'experienceFrom'
type MaxType = 'percentageTo' | 'experienceTo'

const filterConfigs: { [key: string]: { min: MinType; max: MaxType; maxValue: number } } = {
  Percentage: { min: 'percentageFrom', max: 'percentageTo', maxValue: 100 },
  Experience: { min: 'experienceFrom', max: 'experienceTo', maxValue: 100 },
};

export function PercentageFilter({
  formData,
  setValue,
  filterName,
  errors,
  setError,
  clearErrors
}: FilterOptionsProps) {
  const [activeFilter, setActiveFilter] = useState(false);
  const handleOpenFilter = () => setActiveFilter((prv) => !prv);

  const fieldsName = useMemo(
    () => filterConfigs[filterName as keyof typeof filterConfigs] || null,
    [filterName]
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      name: keyof ResultFilter,
    ) => {
      setValue(name, e.target.value);
      if (fieldsName) {
        clearErrors?.(fieldsName.min);
        clearErrors?.(fieldsName.max);
        const minVal = name === fieldsName.min ? e.target.value : formData[fieldsName.min];
        const maxVal = name === fieldsName.max ? e.target.value : formData[fieldsName.max];

        if (setError) {
          if (minVal && Number(minVal) < 0)
            return setError(fieldsName.min, { type: 'manual', message: `${fieldsName.min} cannot be negative` });
          if (maxVal && Number(maxVal) > fieldsName.maxValue)
            return setError(fieldsName.max, { type: 'manual', message: `${fieldsName.max} cannot be greater than ${fieldsName.maxValue}` });
          if (minVal && maxVal && Number(minVal) > Number(maxVal))
            return setError(fieldsName.min, { type: 'manual', message: `${fieldsName.min} cannot be greater than ${fieldsName.max}` });
        }
      }
    },
    [fieldsName, setValue, setError, clearErrors, formData]
  );

  const handleDateButton = useCallback((value: string) => {
    setValue('days', value);
    const now = Date.now();
    const days = value === 'Last 7 Days' ? 7 : 30;
    setValue('startDate', new Date(now - days * 24 * 60 * 60 * 1000));
    setValue('endDate', new Date(now));
  }, [setValue]);

  const handleDateRange = useCallback((e: DateRange) => {
    setValue('days', '');
    setValue('startDate', e.from);
    setValue('endDate', e.to);
  }, [setValue]);

  const renderNumberFilter = useCallback(() => {
    if (!fieldsName) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            type="number"
            placeholder="Min"
            className="w-20"
            value={formData[fieldsName.min] || ''}
            min={0}
            onChange={e => handleChange(e, fieldsName.min)}
          />
          <span className="text-gray-500">to</span>
          <Input
            type="number"
            placeholder="Max"
            className="w-20"
            value={formData[fieldsName.max] || ''}
            max={fieldsName.maxValue}
            onChange={e => handleChange(e, fieldsName.max)}
          />
        </div>
        {errors?.[fieldsName.min] && <p className="text-red-500 text-sm">{errors[fieldsName.min]?.message}</p>}
        {errors?.[fieldsName.max] && <p className="text-red-500 text-sm">{errors[fieldsName.max]?.message}</p>}
      </div>
    );
  }, [fieldsName, formData, handleChange, errors]);

  const renderDateFilter = useCallback(() => (
    <div className="space-y-2">
      <DateRangePicker
        onSelect={e => handleDateRange(e as DateRange)}
        selected={{ from: formData.startDate as Date, to: formData.endDate as Date }}
      />
      <div className="flex gap-2 flex-wrap">
        {['Last 7 Days', 'Last 30 Days'].map(label => (
          <Button
            key={label}
            variant={formData?.days === label ? 'default' : 'outline'}
            onClick={() => handleDateButton(label)}
            className="text-sm"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  ), [formData.startDate, formData.endDate, formData.days, handleDateButton, handleDateRange]);

  const content = useMemo(() => {
    if (fieldsName) return renderNumberFilter();
    if (filterName === 'Exam Date') return renderDateFilter();
    return null;
  }, [fieldsName, filterName, renderNumberFilter, renderDateFilter]);

  return (
    <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0 z-10">
      <Popover.Root onOpenChange={handleOpenFilter}>
        <Popover.Trigger asChild>
          <div className="relative">
            <Button
              variant="outline"
              className={cn(
                'h-11 text-sm font-medium gap-2 whitespace-nowrap',
                'bg-white dark:bg-background border-gray-200 dark:border-border',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'transition-all duration-200 w-40',
                activeFilter && 'border-blue-500 dark:border-blue-400'
              )}
            >
              {filterName}
              {activeFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-10">
            <div
              className={cn(
                'mt-2 w-72 bg-white dark:bg-background',
                'border border-gray-200 dark:border-border rounded-lg shadow-lg',
                'p-4 transform origin-top'
              )}
            >
              {content}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}