"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { CardTitle } from '../ui/card'
import { Input } from '../ui/form/input'
import { Button } from '../ui/form/button'
import RoleForm from './role-form';
import { useRoleStore } from '@/store/roleStore'
import { useAuthStore } from '@/store/authStore'



function Header() {

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { setRolesFilter, rolesCount } = useRoleStore()
  const { user } = useAuthStore()
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }
  const handleCreateRole = () => {
    setOpen(true)
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setRolesFilter(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className='flex justify-between w-full'>
      <CardTitle className="text-xl font-semibold">
        All Roles ({rolesCount || 0})
      </CardTitle>
      <div className="flex space-x-4 items-center">
        <Input
          type="text"
          placeholder="Search Roles..."
          className="w-64"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
        />
        {user?.role?.name == 'Super Admin' && <Button
          onClick={handleCreateRole}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Create Role
        </Button>}
      </div>
      <RoleForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default Header
