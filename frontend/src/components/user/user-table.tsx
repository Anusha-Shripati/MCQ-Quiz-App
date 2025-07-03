'use client';

import React, { useEffect, useState } from 'react';
import { UserData } from '@/types/common.types';
import { Button } from '../ui/form/button';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { deleteData, fetcher } from '@/lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { isAxiosError } from '@/lib/api';
import UserForm from './user-form';
import { useAuthStore } from '@/store/authStore';
import ReusableTable from '../common/reusable-table';
import StatusWrapper from '../common/status-wrapper';
import { userEndpoint } from '@/lib/endpoint';
import { DeleteDialog } from '../common/delete-dialog';

function UserTable() {
  const [user, setUser] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);
  const handleEditUser = (user: UserData) => {
    setUser(user);
    setOpen(true);
  };
  const { userFilter, setUserListData, userList, permissions, paramsLoading } = useAuthStore();

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false)

  const {
    data: users,
    isLoading,
    error,
    mutate,
    isValidating
  } = useSWR(paramsLoading ? null : `${userEndpoint.LIST}?search=${userFilter}`, fetcher);

  useEffect(() => {
    setUserListData(users?.data?.count || 0, users?.data?.list || []);
  }, [setUserListData, users]);

  const onDelete = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const handleUserDelete = async (id: string) => {
    try {
      const res = await deleteData(`/user/${id}`);
      if (res.success) {
        toast.success('User deleted successfully');
      }
      mutate(`${userEndpoint.LIST}?search=${userFilter}`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'User Name', render: (row: UserData) => row.name },
    { key: 'email', header: 'Email', render: (row: UserData) => row.email },
    { key: 'role', header: 'Role', render: (row: UserData) => row.role?.name },
    { key: 'created_by', header: 'Creted By', render: (row: UserData) => row.created_by_user?.name || '-' },
    {
      key: 'action',
      header: 'Action',
      render: (row: UserData) => (
        <div className="flex space-x-2">
          {permissions?.users.can_edit && (
            <Button variant="ghost" size="icon" onClick={() => handleEditUser(row)}>
              <FiEdit className="h-4 w-4" />
            </Button>
          )}
          {row.role?.name !== 'Super Admin' && permissions?.users.can_edit && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
              <FiTrash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];
  return (
    <StatusWrapper className="min-h-[74vh]" error={error} loading={isLoading || isValidating} reset={mutate}>
      <ReusableTable columns={columns} rows={userList} rowKey="id"
        className="h-[550px] animate-in fade-in duration-300"
      />

      <UserForm open={open} userData={user} onClose={() => setOpen(false)} />
      <DeleteDialog onDelete={() => handleUserDelete(deleteId as string)} setOpen={setDeleteOpen} isOpen={deleteOpen} />
    </StatusWrapper>
  );
}

export default UserTable;
