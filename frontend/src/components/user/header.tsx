"use client"

import React, { useEffect, useState } from 'react'
import { CardTitle } from '../ui/card'
import { Input } from '../ui/form/input'
import { Button } from '../ui/form/button'
import { useAuthStore } from '@/store/authStore';
import UserForm from './user-form';



function Header() {

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { setUserFilter,userCount } = useAuthStore()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }
  const handleCreateUser = () => {
    setOpen(true)
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserFilter(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className='flex justify-between w-full'>
      <CardTitle className="text-xl font-semibold">
        All Users ({userCount || 0})
      </CardTitle>
      <div className="flex space-x-4 items-center">
        <Input
          type="text"
          placeholder="Search Users..."
          className="w-64"
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
        />
        <Button
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Create User
        </Button>
      </div>
      <UserForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default Header
