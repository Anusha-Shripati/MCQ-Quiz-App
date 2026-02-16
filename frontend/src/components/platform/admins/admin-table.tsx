'use client';

import React, { useEffect, useState } from 'react';
import { UserData } from '@/types/common.types';
import { Button } from '@/components/ui/form/button';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { deleteData, fetcher } from '@/lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { isAxiosError } from '@/lib/api';
import AdminForm from './admin-form';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import ReusableTable from '@/components/common/reusable-table';
import StatusWrapper from '@/components/common/status-wrapper';
import { userEndpoint } from '@/lib/endpoint';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function AdminTable() {
  const [admin, setAdmin] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleEditAdmin = (admin: UserData) => {
    setAdmin(admin);
    setOpen(true);
  };
  
  const { permissions } = usePlatformAuthStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, []);

  const {
    data: admins,
    isLoading,
    error,
    mutate,
    isValidating,
  } = useSWR(`${userEndpoint.LIST}?search=${searchTerm}`, fetcher);

  const onDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleAdminDelete = async (id: string) => {
    try {
      const res = await deleteData(`/user/${id}`);
      if (res.success) {
        toast.success('Platform admin deleted successfully');
      }
      mutate(`${userEndpoint.LIST}?search=${searchTerm}`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Admin Name', render: (row: UserData) => row.name },
    { key: 'email', header: 'Email', render: (row: UserData) => row.email },
    { key: 'role', header: 'Role', render: (row: UserData) => row.role?.name },
    {
      key: 'created_by',
      header: 'Created By',
      render: (row: UserData) => row.created_by_user?.name || '-',
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: UserData) => (
        <div className="flex space-x-2">
          {permissions?.admins.can_edit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditAdmin(row)}
                  className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  <FiEdit className="h-4 w-4 text-indigo-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Edit Admin</p>
              </TooltipContent>
            </Tooltip>
          )}

          {row.role?.name !== 'Super Admin' && permissions?.admins.can_edit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                  <FiTrash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Delete Admin</p>
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
          rows={admins?.data?.list || []}
          rowKey="id"
          className="h-full animate-in fade-in duration-300"
        />
      </div>

      <AdminForm open={open} adminData={admin} onClose={() => setOpen(false)} />
      <DeleteDialog
        onDelete={() => handleAdminDelete(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
      />
    </StatusWrapper>
  );
}

export default AdminTable;
