'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '../ui/form/input';
import { Button } from '../ui/form/button';
import { useAuthStore } from '@/store/authStore';
import UserForm from './user-form';
import { usePathname } from 'next/navigation';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { setUserFilter, permissions } = useAuthStore();
  const pathname = usePathname();
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleCreateUser = () => {
    setOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      setUserFilter(searchTerm);

      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, setUserFilter]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
      setUserFilter(search);
    }
  }, []);

  return (
    <div className="flex justify-end w-full mb-4">
      <div className="flex space-x-4 items-center">
        <Input
          type="search"
          placeholder="Search Users..."
          className="w-64"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
        />
        {permissions?.users?.can_edit && (
          <Button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Create User
          </Button>
        )}
      </div>
      <UserForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default Header;
