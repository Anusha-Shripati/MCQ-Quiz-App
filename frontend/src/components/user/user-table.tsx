"use client"

import React, { useEffect,  useState } from 'react'
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
import ReusableTable from '../common/reusable-table'

function UserTable() {

    const [user, setUser] = useState<UserData | null>(null)
    const [open, setOpen] = useState(false);
    const handleEditUser = (user: UserData) => {
        setUser(user)
        setOpen(true)
    };
    const { userFilter, setUserListData, userList,permissions } = useAuthStore();

    const { data: users, isLoading, error, mutate } = useSWR(`/user/list?search=${userFilter}`, fetcher)

    useEffect(() => {
        setUserListData(users?.data?.count || 0, users?.data?.list || [])
    }, [users])

    const handleUserDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const res = await deleteData(`/user/${id}`)
                if (res.success) {
                    toast.success("User deleted successfully");
                }
                mutate(`/user/list?search=${userFilter}`)
            } catch (error) {
                if (isAxiosError(error)) {
                    toast.error(error.response.data.message || "An unexpected error occurred");
                } else {
                    toast.error("An unexpected error occurred");
                }
            }
        }
    };

    const columns = [
        { key: 'name', header: "User Name", render: (row: UserData) => row.name },
        { key: 'email', header: "Email", render: (row: UserData) => row.email },
        { key: 'role', header: "Role", render: (row: UserData) => row.role?.name },
        {
            key: 'action', header: "Action", render: (row: UserData) => (
                <div className="flex space-x-2">
                   {permissions?.users.can_edit && <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(row)}
                    >
                        <FiEdit className="h-4 w-4" />
                    </Button>}
                    {row.role?.name !== 'Super Admin' && permissions?.users.can_edit &&
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUserDelete(row.id)}
                        >
                            <FiTrash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    }
                </div>
            )
        },
    ]
    if (isLoading) {
        return <LoadingSpinner className='min-h-[500px]' />
    }
    if (error) {
        return <Error error={error} reset={() => { window.location.reload() }} />
    }
    return (
        <div className='min-h-[500px]'>
            <ReusableTable columns={columns} rows={userList} rowKey='id' />
            <UserForm open={open} userData={user} onClose={() => setOpen(false)} />

        </div>
    )
}

export default UserTable
