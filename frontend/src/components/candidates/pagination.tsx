import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="space-x-2 mr-4">
        <Button
          className="bg-primary text-primary-foreground  rounded-lg"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          className="bg-primary text-primary-foreground  rounded-lg"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
