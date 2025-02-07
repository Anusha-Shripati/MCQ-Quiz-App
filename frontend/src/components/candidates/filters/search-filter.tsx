import { Input } from "../../ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchFilter({ searchQuery, setSearchQuery }: SearchFilterProps) {
  return (
    <div className="relative w-full md:w-64 lg:w-72 shrink-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder="Search name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={cn(
          "pl-10 pr-4 h-11 w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
          "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent",
          "placeholder-gray-400 dark:placeholder-gray-500",
          "rounded-lg shadow-sm transition-all duration-200",
          "hover:border-gray-300 dark:hover:border-gray-600"
        )}
      />
      {searchQuery && (
        <Button
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 