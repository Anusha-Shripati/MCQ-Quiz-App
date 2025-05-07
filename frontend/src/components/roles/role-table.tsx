'use client';

import React, { useEffect, useState } from 'react';
import { RoleData } from '@/types/common.types';
import { Button } from '../ui/form/button';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { deleteData, fetcher } from '@/lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { isAxiosError } from '@/lib/api';
import RoleForm from './role-form';
// import Error from "@/app/error";
// import { LoadingSpinner } from "../ui/loading-spinner";
import ReusableTable from '../common/reusable-table';
import { useRoleStore } from '@/store/roleStore';
import { Badge } from '../ui/badge';
import { useAuthStore } from '@/store/authStore';
import StatusWrapper from '../common/status-wrapper';

function RoleTable() {
  const [role, setRole] = useState<RoleData | null>(null);
  const { user,paramsLoading } = useAuthStore();
  const [open, setOpen] = useState(false);
  const handleEditRole = (role: RoleData) => {
    setRole(role);
    setOpen(true);
  };
  const { rolesFilter, setRolesListData, rolesList } = useRoleStore();

  const {
    data: users,
    isLoading,
    error,
    mutate,
  } = useSWR(paramsLoading ? null : `/role/list?search=${rolesFilter}`, fetcher);

  useEffect(() => {
    setRolesListData(users?.data?.count || 0, users?.data?.list || []);
  }, [setRolesListData, users]);

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        const res = await deleteData(`/role/${id}`);
        if (res.success) {
          toast.success('Role deleted successfully');
        }
        mutate(`/role/list?search=${rolesFilter}`);
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response.data.message || 'An unexpected error occurred');
        } else {
          toast.error('An unexpected error occurred');
        }
      }
    }
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
                  <Badge key={item.id} variant="default">
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
          {user?.role?.name == 'Super Admin' && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleEditRole(row)}>
                <FiEdit className="h-4 w-4" />
              </Button>
              {row.name !== 'Super Admin' && (
                <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(row.id)}>
                  <FiTrash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </>
      ),
    },
  ];
  return (
    <StatusWrapper loading={isLoading} error={error} className="min-h-[500px]">
      <ReusableTable columns={columns} rows={rolesList} rowKey="id" />
      <RoleForm open={open} roleData={role} onClose={() => setOpen(false)} />
    </StatusWrapper>
  );
}

export default RoleTable;
