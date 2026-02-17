'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/form/input';
import { Button } from '@/components/ui/form/button';
import RoleForm from './role-form';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import { usePathname } from 'next/navigation';
import { Plus, Search } from 'lucide-react';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { platformAdmin } = usePlatformAuthStore();
  const pathname = usePathname();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreateRole = () => {
    setOpen(true);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, []);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search Platform Roles..."
            value={searchTerm}
            onChange={handleSearch}
            autoComplete="off"
            className="pl-10 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {platformAdmin?.role?.name === 'Super Admin' && (
          <Button
            onClick={handleCreateRole}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-9 px-4 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      {open && (
        <RoleForm open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export default Header;
