'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '../ui/form/input';
import { Button } from '../ui/form/button';
import RoleForm from './role-form';
import { useRoleStore } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { setRolesFilter } = useRoleStore();
  const { user } = useAuthStore();
  const pathname = usePathname()

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
      setRolesFilter(searchTerm);
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, setRolesFilter]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
      setRolesFilter(search);
    }
  }, []);

  return (
    <div className="flex justify-between w-full mb-4">
      <Input
        type="search"
        placeholder="Search Roles..."
        className="w-64 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white focus:border-transparent"
        value={searchTerm}
        onChange={handleSearch}
        autoComplete="off"
      />
      <div className="flex space-x-4 items-center">
        {user?.role?.name == 'Super Admin' && (
          <Button
            onClick={handleCreateRole}
            className="bg-foreground text-secondary hover:bg-foreground/90 shadow-sm"
          >
            <PlusCircle className=" h-4 w-4" />
            Create Role
          </Button>
        )}
      </div>
      <RoleForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default Header;
