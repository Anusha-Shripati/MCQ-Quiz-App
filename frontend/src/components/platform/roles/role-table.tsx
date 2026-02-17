'use client';

import React, { useEffect, useState } from 'react';
import { RoleData } from '@/types/common.types';
import { Button } from '@/components/ui/form/button';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { deleteData, fetcher } from '@/lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { isAxiosError } from '@/lib/api';
import RoleForm from './role-form';
import { Badge } from '@/components/ui/badge';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import { platformRoleEndpoint } from '@/lib/endpoint';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import StatusWrapper from '@/components/common/status-wrapper';

function RoleTable() {
  const [role, setRole] = useState<RoleData | null>(null);
  const { platformAdmin } = usePlatformAuthStore();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, []);

  const {
    data: roles,
    isLoading,
    error,
    mutate,
    isValidating,
  } = useSWR(`${platformRoleEndpoint.LIST}?search=${searchTerm}`, fetcher);

  const handleEditRole = (role: RoleData) => {
    setRole(role);
    setOpen(true);
  };

  const onDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteRole = async (id: string) => {
    try {
      const res = await deleteData(`${platformRoleEndpoint.ROLE_BY_ID}/${id}`);
      if (res.success) {
        toast.success('Platform role deleted successfully');
      }
      mutate(`${platformRoleEndpoint.LIST}?search=${searchTerm}`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const columns: PlatformColumn<RoleData>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.role_permissions.map((item) => {
            return (
              <React.Fragment key={item.id}>
                {(item.can_edit || item.can_read) && (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
                  >
                    {item.module?.name}
                  </Badge>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      render: (row) => (
        <>
          {platformAdmin?.role?.name === 'Super Admin' && (
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRole(row)}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    <FiEdit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  <p>Edit Role</p>
                </TooltipContent>
              </Tooltip>

              {row.name !== 'Super Admin' && (
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
                    <p>Delete Role</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <StatusWrapper
      loading={isLoading || isValidating}
      error={error}
      className="min-h-[83vh] flex"
      reset={mutate}
    >
      <div className="flex-1 overflow-hidden">
        <PlatformTable
          columns={columns}
          data={roles?.data?.list || []}
          rowKey="id"
          emptyMessage="No roles found"
        />
      </div>

      <RoleForm open={open} roleData={role} onClose={() => setOpen(false)} />
      <DeleteDialog
        onDelete={() => handleDeleteRole(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
        title="Delete Role"
        description="This action cannot be undone. This will permanently delete the role."
      />
    </StatusWrapper>
  );
}

export default RoleTable;
