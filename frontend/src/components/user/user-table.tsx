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
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

function UserTable() {
  const [user, setUser] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);
  const handleEditUser = (user: UserData) => {
    setUser(user);
    setOpen(true);
  };
  const { userFilter, setUserListData, userList, permissions, paramsLoading } = useAuthStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const {
    data: users,
    isLoading,
    error,
    mutate,
    isValidating,
  } = useSWR(paramsLoading ? null : `${userEndpoint.LIST}?search=${userFilter}`, fetcher);

  useEffect(() => {
    setUserListData(users?.data?.count || 0, users?.data?.list || []);
  }, [setUserListData, users]);

  const onDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

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
    {
      key: 'created_by',
      header: 'Creted By',
      render: (row: UserData) => row.created_by_user?.name || '-',
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: UserData) => (
        <div className="flex space-x-2">
          {permissions?.users.can_edit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditUser(row)}
                  className="hover:bg-gray-200
                dark:hover:bg-gray-900">
                  <FiEdit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Edit User</p>
              </TooltipContent>
            </Tooltip>
          )}

          {row.role?.name !== 'Super Admin' && permissions?.users.can_edit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                  <FiTrash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Delete User</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];
  return (
    <StatusWrapper
      className="min-h-[83vh] flex"
      error={error}
      loading={isLoading || isValidating}
      reset={mutate}
    >
      <div className="flex-1 overflow-hidden">
        <ReusableTable
          columns={columns}
          rows={userList}
          rowKey="id"
          className="h-full animate-in fade-in duration-300"
        />
      </div>

      <UserForm open={open} userData={user} onClose={() => setOpen(false)} />
      <DeleteDialog
        onDelete={() => handleUserDelete(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
        title="Delete User"
        description="This action cannot be undone. This will permanently delete the user."
      />
    </StatusWrapper>
  );
}

export default UserTable;
