import { api, isAxiosError } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/common/form-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/form/button';
import PermissionsTable from './permission-table';
import { Module, Permissions, RoleData } from '@/types/common.types';
import useSWRMutation from 'swr/mutation';
import { platformModuleEndpoint, platformRoleEndpoint } from '@/lib/endpoint';
import { showSingleToast } from '@/lib/utils';

const permissionSchema = z.object({
  can_read: z.boolean(),
  can_edit: z.boolean(),
  module_id: z.string(),
});

const roleSchema = z.object({
  name: z.string().min(1, 'Role is required.').max(20, 'Role can not exceed max length 20.'),
  role_permissions: z.array(permissionSchema),
});

const defaultRole: Omit<RoleData, 'id'> & Partial<Pick<RoleData, 'id'>> = {
  name: '',
  role_permissions: [],
};

async function create(url: string, { arg }: { arg: Partial<RoleData> }) {
  const response = await api.post(url, arg);
  return response;
}

async function update(url: string, { arg }: { arg: Partial<RoleData> }) {
  const response = await api.put(url, arg);
  return response;
}

function RoleForm({
  open,
  onClose,
  roleData = null,
}: {
  open: boolean;
  onClose: () => void;
  roleData?: RoleData | null;
}) {
  const {
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { errors },
  } = useForm<RoleData>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultRole,
  });
  
  const [permissionData, setPermissionData] = useState<Permissions[]>([]);

  const handleCheckboxChange = (index: number, type: 'can_edit' | 'can_read', value: boolean) => {
    setPermissionData((prev) => {
      const updatedPermissions = [...prev];
      updatedPermissions[index][type] = value;
      setValue('role_permissions', updatedPermissions, { shouldValidate: true });
      return updatedPermissions;
    });
  };

  const { data: modules } = useSWR(platformModuleEndpoint.LIST, api.get);
  const { trigger, isMutating } = useSWRMutation(platformRoleEndpoint.CREATE, create);
  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(
    `${platformRoleEndpoint.ROLE_BY_ID}/${roleData?.id}`,
    update
  );

  useEffect(() => {
    if (modules?.data?.list && !roleData) {
      setPermissionData(
        modules.data.list.map((item: Module) => ({
          module: { id: item.id, name: item.name },
          module_id: item.id,
          can_edit: false,
          can_read: false,
        }))
      );
    }
  }, [modules, open]);

  useEffect(() => {
    if (open) {
      const formData = {
        name: roleData?.name || '',
        role_permissions:
          (roleData?.role_permissions ?? []).length > 0
            ? roleData?.role_permissions
            : permissionData,
      };
      setPermissionData(formData.role_permissions || []);
      reset(formData);
    }
  }, [open]);

  const handleCreateOrUpdateRole = async (data: RoleData) => {
    try {
      const payload = {
        name: data.name,
        role_permissions: data.role_permissions.map((perm) => ({
          module_id: perm.module_id,
          can_read: perm.can_read,
          can_edit: perm.can_edit,
        })),
      };
      
      if (data.role_permissions.every((item) => item.can_edit === false && item.can_read === false)) {
        showSingleToast('At least one permission must be selected');
        return;
      }
      
      let res;
      if (roleData) {
        res = await updateTrigger(payload);
      } else {
        res = await trigger(payload);
      }

      if (res.success) {
        toast.success(roleData ? 'Platform role updated successfully' : 'Platform role created successfully');
        mutate((key) => typeof key === 'string' && key.startsWith(platformRoleEndpoint.LIST));
        onClose();
      } else {
        toast.error(res.message);
      }
      
      modules.data.list.map((item: Module) => ({
        module: { id: item.id, name: item.name },
        module_id: item.id,
        can_edit: false,
        can_read: false,
      }));
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'An error occurred'
          : 'An unexpected error occurred'
      );
    }
  };

  const handleClose = () => {
    reset(defaultRole);
    setPermissionData(
      modules.data.list.map((item: Module) => ({
        module: { id: item.id, name: item.name },
        module_id: item.id,
        can_edit: false,
        can_read: false,
      }))
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-primary" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>{roleData ? 'Edit' : 'Create'} Platform Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleCreateOrUpdateRole)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormField
                label="Name"
                {...register('name')}
                placeholder="Role Name"
                className="dark:bg-secondary"
                error={errors.name?.message}
              />
            </div>
            <PermissionsTable
              permissions={permissionData}
              onCheckboxChange={handleCheckboxChange}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={handleClose} disabled={isMutating || updating}>
                Close
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700" 
                disabled={isMutating || updating}
              >
                {roleData ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleForm;
