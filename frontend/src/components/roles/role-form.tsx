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

const permissionSchema = z.object({
  can_read: z.boolean(),
  can_edit: z.boolean(),
  module_id: z.string(),
});

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rolePermissions: z.array(permissionSchema),
});

const defaultRole: Omit<RoleData, "id"> & Partial<Pick<RoleData, "id">> = {
  name: "",
  rolePermissions: [],
};

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
      setValue("rolePermissions", updatedPermissions, { shouldValidate: true });
      return updatedPermissions;
    });
  };

  const { data: modules } = useSWR("/module/list", api.get);

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
        rolePermissions: (roleData?.rolePermissions ?? []).length > 0
        ? roleData?.rolePermissions
        : permissionData
          // roleData?.rolePermissions?.length > 0
          //   ? roleData.rolePermissions
          //   : permissionData,
      };
      setPermissionData(formData.rolePermissions || [])
      reset(formData);
    }
  }, [open]);



  const handleCreateOrUpdateRole = async (data: RoleData) => {
    try {

      const payload = {
        name: data.name,
        rolePermissions: data.rolePermissions.map((perm) => ({
          module_id: perm.module_id,
          can_read: perm.can_read,
          can_edit: perm.can_edit,
        })),
      };
      let res;
      if(roleData){
        res = await api.put(`/role/${roleData.id}`,payload);
      }else{
        res = await api.post("/role/create",payload);
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
              <Button variant="destructive" onClick={handleClose}>
                Close
              </Button>
              <Button type="submit" className="bg-green-600">
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
