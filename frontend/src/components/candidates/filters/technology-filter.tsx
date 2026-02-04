import React from 'react';
import Select from 'react-select';
import { cn } from '@/lib/utils';
import { StatusOption } from '@/types/common.types';

interface TechnologyFilterProps {
  value: StatusOption[];
  onChange: (value: StatusOption[]) => void;
  options: StatusOption[];
  className?: string;
}

export function TechnologyFilter({ value, onChange, options, className }: TechnologyFilterProps) {
  return (
    <div className={cn('w-full md:w-60 shrink-0', className)}>
      <Select
        isMulti
        value={value}
        onChange={(newValue) => onChange(newValue as StatusOption[])}
        options={options}
        placeholder="Select technologies"
        classNamePrefix="react-select"
        blurInputOnSelect={true}
        classNames={{
          control: () =>
            'dark:bg-background border border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-gray-600 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent !border-solid',
        }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'var(--bg-color, white)',
            color: 'var(--text-color, #111827)',
            minHeight: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
          }),
          valueContainer: (base) => ({
            ...base,
            maxHeight: '2.5rem',
            overflow: 'hidden',
            flexWrap: 'nowrap',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'var(--bg-color, white)',
            zIndex: 50,
          }),
          input: (base) => ({
            ...base,
            color: 'var(--text-color, #111827)',
          }),
          singleValue: (base) => ({
            ...base,
            color: 'var(--text-color, #111827)',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? 'var(--highlight-color, #f3f4f6)'
              : 'var(--bg-color, white)',
            color: 'var(--text-color, #111827)',
            '&:hover': {
              backgroundColor: 'var(--highlight-color, #f3f4f6)',
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: 'var(--highlight-color, #f3f4f6)',
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: 'var(--text-color, #111827)',
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: 'var(--text-color, #111827)',
            cursor: 'pointer',
            ':hover': {
              backgroundColor: '#ef4444',
              color: 'white',
            },
          }),
          clearIndicator: (base) => ({
            ...base,
            cursor: 'pointer',
          }),
          placeholder: (base) => ({
            ...base,
            color: 'var(--placeholder-color, #6b7280)',
          }),
        }}
      />
    </div>
  );
}
