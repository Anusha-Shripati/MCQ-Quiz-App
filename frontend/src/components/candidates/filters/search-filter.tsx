import { Input } from '../../ui/form/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchFilter({ searchQuery, setSearchQuery }: SearchFilterProps) {
  return (
    <div className="relative w-full md:w-64 shrink-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input
        type="search"
        placeholder="Search by name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={cn(
          'pl-10 pr-4 h-10 w-full bg-white dark:bg-primary border-gray-200 dark:border-border',
          'focus:ring-2 focus:ring-blue-500 dark:focus:ring-white focus:border-transparent',
          'placeholder:text-gray-500 text-sm',
          'rounded-lg shadow-sm transition-all duration-200',
          'hover:border-gray-300 dark:hover:border-gray-600'
        )}
      />
    </div>
  );
}
