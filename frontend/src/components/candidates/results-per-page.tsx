// components/pagination/ResultsPerPage.tsx
'use client';
import { FormField } from '../common/form-field';
import { useMemo } from 'react';

interface ResultsPerPageProps {
  currentPageStart: number;
  currentPageEnd: number;
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

export function ResultsPerPage({
  currentPageStart,
  currentPageEnd,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
}: ResultsPerPageProps) {
  const options = useMemo(
    () => [
      { value: '10', label: 10 },
      { value: '25', label: 25 },
      { value: '50', label: 50 },
    ],
    []
  );
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
        Showing {currentPageStart}-{currentPageEnd} of {totalItems}
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Results per page</span>
        <FormField
          className="w-[80px]"
          value={itemsPerPage.toString()}
          onChange={(value) => onItemsPerPageChange(Number(value))}
          type="select"
          options={options}
        />
      </div>
    </div>
  );
}
