import { api, isAxiosError } from "@/lib/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FormField } from "../common/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/form/button";
import PermissionsTable from "./permission-table";
import { Module,  Permissions,  RoleData } from "@/types/common.types";
import useSWRMutation from "swr/mutation";
const permissionSchema = z.object({
  can_read: z.boolean(),
  can_edit: z.boolean(),
  module_id: z.string(),
});

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role_permissions: z.array(permissionSchema),
});

const defaultRole: Omit<RoleData, "id"> & Partial<Pick<RoleData, "id">> = {
  name: "",
  role_permissions: [],
};

async function create(url: string, { arg }: { arg:  Partial<RoleData> }) {
  const response = await api.post(url, arg);
  return response;
}
async function update(url: string, { arg }: { arg: Partial<RoleData> }) {
  const response = await api.put(url, arg);
  return response;
}

function RoleForm({ open, onClose, roleData = null }: {open:boolean, onClose: () => void, roleData?: RoleData | null}) {
  
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

  const handleCheckboxChange = (
    index: number,
    type: 'can_edit' | 'can_read',
    value: boolean
  ) => {
    setPermissionData((prev) => {
      const updatedPermissions = [...prev];
      updatedPermissions[index][type] = value;
      setValue("role_permissions", updatedPermissions, { shouldValidate: true });
      return updatedPermissions;
    });
  };

  const { data: modules } = useSWR("/module/list", api.get);


  const { trigger, isMutating } = useSWRMutation(`/role/create`, create);
  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(`/role/${roleData?.id}`, update);

  useEffect(() => {
    if (modules?.data?.list) {
      setPermissionData(
        modules.data.list.map((item: Module) => ({
          module: { id: item.id, name: item.name },
          module_id: item.id,
          can_edit: false,
          can_read: false,
        }))
      );
    }
  }, [modules]);

  useEffect(() => {
    if (open) {
      const formData = {
        name: roleData?.name || "",
        role_permissions: (roleData?.role_permissions ?? []).length > 0
        ? roleData?.role_permissions
        : permissionData
          // roleData?.role_permissions?.length > 0
          //   ? roleData.role_permissions
          //   : permissionData,
      };
      setPermissionData(formData.role_permissions || [])
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
      let res;
      if(roleData){
        res = await updateTrigger(payload);
      }else{
        res = await trigger(payload);
      }

      if (res.success) {
        toast.success(
          roleData ? "Role updated successfully" : "Role created successfully"
        );
        mutate((key) => typeof key === "string" && key.startsWith("/role/list"));
        onClose();
      } else {
        toast.error(res.message);
      }
      modules.data.list.map((item: Module) => ({
        module: { id: item.id, name: item.name },
        module_id: item.id,
        can_edit: false,
        can_read: false,
      }))
    } catch (error) {
      console.log(error);
      
      toast.error(
        isAxiosError(error) ? error.response?.data?.message || "An error occurred" : "An unexpected error occurred"
      );
    }
  };

  const handleClose = () => {
    reset(defaultRole);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md dark:bg-gray-800"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle>{roleData ? "Edit" : "Create"} Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleCreateOrUpdateRole)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormField
                label="Name"
                {...register("name")}
                placeholder="Role Name"
                className="dark:bg-gray-700"
                error={errors.name?.message}
              />
            </div>
            <PermissionsTable
              permissions={permissionData}
              onCheckboxChange={handleCheckboxChange}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={handleClose}  disabled={isMutating || updating}>
                Close
              </Button>
              <Button type="submit" className="bg-green-600" disabled={isMutating || updating}>
                {roleData ? "Update" : "Save"}

              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleForm;
