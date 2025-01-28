// components/pagination/PaginationControls.tsx
"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    onPageChange(Math.max(1, Math.min(newPage, totalPages)));
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, currentPage + 3);

    if (totalPages > maxVisiblePages) {
      if (currentPage <= 4) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 3) {
        startPage = totalPages - maxVisiblePages + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          className="mx-1 min-w-[2rem]"
        >
          {i}
        </Button>
      );
    }

    if (totalPages > maxVisiblePages) {
      if (startPage > 1) {
        pages.unshift(
          <span key="start-ellipsis" className="px-3 py-1">
            ...
          </span>
        );
      }
      if (endPage < totalPages) {
        pages.push(
          <span key="end-ellipsis" className="px-3 py-1">
            ...
          </span>
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-4 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        <div className="flex flex-wrap justify-center">
          {renderPageNumbers()}
        </div>
        
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}