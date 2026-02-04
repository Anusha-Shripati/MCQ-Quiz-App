'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '../ui/form/input';
import { Button } from '../ui/form/button';
import { useAuthStore } from '@/store/authStore';
import UserForm from './user-form';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

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
    <div className="flex justify-between w-full mb-4">
      <Input
        type="search"
        placeholder="Search Users..."
        className="w-64"
        value={searchTerm}
        onChange={handleSearch}
        autoComplete="off"
      />
      <div className="flex space-x-4 items-center">
        {permissions?.users?.can_edit && (
          <Button
            onClick={handleCreateUser}
            className="bg-foreground text-secondary hover:bg-foreground/90 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Create User
          </Button>
        )}
      </div>
      <UserForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default Header;
