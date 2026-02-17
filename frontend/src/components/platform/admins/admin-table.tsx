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
import { platformAdminEndpoint } from '@/lib/endpoint';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import StatusWrapper from '@/components/common/status-wrapper';

function AdminTable() {
  const [admin, setAdmin] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  } = useSWR(`${platformAdminEndpoint.LIST}?search=${searchTerm}`, fetcher);

  const handleEditAdmin = (admin: UserData) => {
    setAdmin(admin);
    setOpen(true);
  };

  const onDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleAdminDelete = async (id: string) => {
    try {
      const res = await deleteData(`${platformAdminEndpoint.ADMIN_BY_ID}/${id}`);
      if (res.success) {
        toast.success('Platform admin deleted successfully');
      }
      mutate(`${platformAdminEndpoint.LIST}?search=${searchTerm}`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const columns: PlatformColumn<UserData>[] = [
    {
      key: 'name',
      header: 'Admin Name',
      render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-slate-600 dark:text-slate-400">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <span className="text-slate-600 dark:text-slate-400">{row.role?.name}</span>,
    },
    {
      key: 'created_by',
      header: 'Created By',
      render: (row) => <span className="text-slate-600 dark:text-slate-400">{row.created_by_user?.name || '-'}</span>,
    },
    {
      key: 'action',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {permissions?.admins.can_edit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditAdmin(row)}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <FiEdit className="h-4 w-4" />
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(row.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <FiTrash2 className="h-4 w-4" />
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
        <PlatformTable
          columns={columns}
          data={admins?.data?.list || []}
          rowKey="id"
          emptyMessage="No admins found"
        />
      </div>

      <AdminForm open={open} adminData={admin} onClose={() => setOpen(false)} />
      <DeleteDialog
        onDelete={() => handleAdminDelete(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
        title="Delete Admin"
        description="This action cannot be undone. This will permanently delete the admin."
      />
    </StatusWrapper>
  );
}

export default AdminTable;
