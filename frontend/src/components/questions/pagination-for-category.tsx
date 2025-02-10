import { Button } from "@/components/ui/button";
import { PaginationProps } from "@/shared/types/app";

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex space-x-2">
      <Button
        disabled={currentPage === 1}
        variant="ghost"
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-3 py-1 border rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600"} dark:bg-white`}
      >
        Prev
      </Button>
      {pageNumbers.map((number) => (
        <Button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 border rounded-md ${
            number === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          {number}
        </Button>
      ))}
      <Button
        disabled={currentPage === totalPages}
        variant="ghost"
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-3 py-1 border rounded-md ${
          currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600"
        } dark:bg-white`}
      >
        Next
      </Button>
    </div>
  );
};