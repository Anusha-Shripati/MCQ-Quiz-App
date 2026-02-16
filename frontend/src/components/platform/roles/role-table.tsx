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
import ReusableTable from '@/components/common/reusable-table';
import { Badge } from '@/components/ui/badge';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import StatusWrapper from '@/components/common/status-wrapper';
import { roleEndpoint } from '@/lib/endpoint';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function RoleTable() {
  const [role, setRole] = useState<RoleData | null>(null);
  const { platformAdmin } = usePlatformAuthStore();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleEditRole = (role: RoleData) => {
    setRole(role);
    setOpen(true);
  };

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
  } = useSWR(`${roleEndpoint.LIST}?search=${searchTerm}`, fetcher);

  const handleDeleteRole = async (id: string) => {
    try {
      const res = await deleteData(`/role/${id}`);
      if (res.success) {
        toast.success('Platform role deleted successfully');
      }
      mutate(`${roleEndpoint.LIST}?search=${searchTerm}`);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const onDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };
  
  const columns = [
    { key: 'name', header: 'Name', render: (row: RoleData) => row.name },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (row: RoleData) => (
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
      header: 'Action',
      render: (row: RoleData) => (
        <>
          {platformAdmin?.role?.name === 'Super Admin' && (
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditRole(row)} 
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <FiEdit className="h-4 w-4 text-indigo-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  <p>Edit Role</p>
                </TooltipContent>
              </Tooltip>

              {row.name !== 'Super Admin' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                      <FiTrash2 className="h-4 w-4 text-destructive" />
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
        <ReusableTable columns={columns} rows={roles?.data?.list || []} rowKey="id" className="h-full" />
      </div>
      <RoleForm open={open} roleData={role} onClose={() => setOpen(false)} />
      <DeleteDialog
        onDelete={() => handleDeleteRole(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
      />
    </StatusWrapper>
  );
}

export default RoleTable;
