// components/pagination/ResultsPerPage.tsx
"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  onItemsPerPageChange
}: ResultsPerPageProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
        Showing {currentPageStart}-{currentPageEnd} of {totalItems}
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Results per page</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}