'use client';

import React, { useEffect, useState } from 'react';
import { CardTitle } from '../ui/card';
import { Input } from '../ui/form/input';
import { Button } from '../ui/form/button';
import RoleForm from './role-form';
import { useRoleStore } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { setRolesFilter, rolesCount } = useRoleStore();
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
      if(searchTerm){
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
    <div className="flex justify-between w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Roles ({rolesCount || 0})</h2>
      <div className="flex space-x-4 items-center">
        <Input
          type="text"
          placeholder="Search Roles..."
          className="w-64"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
        />
        {user?.role?.name == 'Super Admin' && (
          <Button
            onClick={handleCreateRole}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Create Role
          </Button>
        )}
      </div>
      <RoleForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default Header;
