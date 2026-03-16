'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/form/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function TenantRequestHeader() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Default to all
  const pathname = usePathname();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const status = params.get('status');
    if (search) {
      setSearchTerm(search);
    }
    if (status) {
      setStatusFilter(status);
    }
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tenant requests..."
            value={searchTerm}
            onChange={handleSearch}
            autoComplete="off"
            className="pl-10 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}