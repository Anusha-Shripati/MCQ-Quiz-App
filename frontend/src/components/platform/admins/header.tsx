'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/form/input';
import { Button } from '@/components/ui/form/button';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import AdminForm from './admin-form';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { permissions } = usePlatformAuthStore();
  const pathname = usePathname();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCreateAdmin = () => {
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
    <div className="flex justify-between w-full mb-4">
      <Input
        type="search"
        placeholder="Search Platform Admins..."
        className="w-64"
        value={searchTerm}
        onChange={handleSearch}
        autoComplete="off"
      />
      <div className="flex space-x-4 items-center">
        {permissions?.admins?.can_edit && (
          <Button
            onClick={handleCreateAdmin}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Create Admin
          </Button>
        )}
      </div>
      <AdminForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default Header;
