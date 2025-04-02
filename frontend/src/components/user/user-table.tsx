"use client"

import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { UserData } from '@/types/common.types'
import { Button } from '../ui/form/button'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { deleteData, fetcher } from '@/lib/api'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { isAxiosError } from '@/lib/api'
import UserForm from './user-form'
import { useAuthStore } from '@/store/authStore'
import Error from '@/app/error'
import { LoadingSpinner } from '../ui/loading-spinner'

function UserTable() {

    const [user, setUser] = useState<UserData | null>(null)
    const [open, setOpen] = useState(false);
    const handleEditUser = (user: UserData) => {
        setUser(user)
        setOpen(true)
    };
    const { userFilter, setUserListData, userList } = useAuthStore();

    const { data: users, isLoading, error, mutate } = useSWR(`/user/list?search=${userFilter}`, fetcher)

    useEffect(() => {
        setUserListData(users?.data?.count || 0, users?.data?.list || [])
    }, [users])

    const handleUserDelete = async (id: string) => {
        mutate(`/user/list?search=${userFilter}`)
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const res = await deleteData(`/user/${id}`)
                if (res.success) {
                    toast.success("User deleted successfully");
                }
            } catch (error) {
                if (isAxiosError(error)) {
                    toast.error(error.response.data.message || "An unexpected error occurred");
                } else {
                    toast.error("An unexpected error occurred");
                }
            }
        }
    };


    if (isLoading ) {
        return <LoadingSpinner className='min-h-[500px]'/>
    }
    if (error) {
        return <Error error={error} reset={() => { window.location.reload() }} />
    }
    return (
        <div className='min-h-[500px]'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userList.length > 0 && userList.map((user: UserData, index: number) => (
                        <TableRow key={index}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role?.name}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditUser(user)}
                                    >
                                        <FiEdit className="h-4 w-4" />
                                    </Button>
                                    {/* {user.role?.name !== 'Super Admin' &&  */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleUserDelete(user.id)}
                                    >
                                        <FiTrash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    {/* } */}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <UserForm open={open} userData={user} onClose={() => setOpen(false)} />

        </div>
    )
}

export default UserTable
