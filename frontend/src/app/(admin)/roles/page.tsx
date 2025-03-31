"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/form/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PermissionsTable from "@/components/users/permission-table";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/common/form-field";
import { modules as  availableModules, rolesDataStatic } from "@/shared/constants/data";


const permissionSchema = z.object({
  createEdit: z.boolean(),
  view: z.boolean(),
  delete: z.boolean(),
});

const roleSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    permissions: z.record(permissionSchema),
  })

type RoleFormValues = z.infer<typeof roleSchema>;

const defaultPermissions = availableModules.reduce(
  (acc, module) => {
    acc[module] = { createEdit: false, view: false, delete: false };
    return acc;
  },
  {} as Record<string, z.infer<typeof permissionSchema>>
);

const defaultRole: RoleFormValues = {
  name: "",
  permissions: defaultPermissions,
};

const UserTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleIndex, setEditingRoleIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<RoleFormValues[]>(rolesDataStatic || []);


  
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultRole,
  });
  
  const handleCheckboxChange = (
    category: string,
    type: keyof z.infer<typeof permissionSchema>,
    value: boolean
  ) => {
    setValue(`permissions.${category}.${type}`, value, {
      shouldValidate: true,
    });
  };

  const handleCreateOrUpdateRole = (data: RoleFormValues) => {
    if (editingRoleIndex !== null) {
      const updatedUsers = [...roles];
      updatedUsers[editingRoleIndex] = data;
      setRoles(updatedUsers);
      toast.success("Roles updated successfully");
    } else {
      if (roles.some((role) => role.name === data.name)) {
        toast.error("Sorry! Role with this name already exists!");
      } else {
        setRoles([...roles, data]);
        toast.success("User created successfully");
      }
    }
    closeModal();
  };

  const handleEditRole = (index: number) => {
    reset(roles[index]);
    setEditingRoleIndex(index);
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    reset(defaultRole);
    setEditingRoleIndex(null);
    setIsModalOpen(true);
  };

  const handleRoleDelete = (name: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.name !== name));
      toast.success("Role deleted successfully");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoleIndex(null);
    reset(defaultRole);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            All Roles ({filteredRoles.length})
          </CardTitle>
          <div className="flex space-x-4 items-center">
            <Input
              type="text"
              placeholder="Search Roles..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Create Roles</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role, index) => (
                <TableRow key={index}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(role.permissions)
                        .filter((module) =>
                          Object.values(role.permissions[module]).some(Boolean)
                        )
                        .map((module) => (
                          <Badge key={module} variant="default">
                            {module}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRole(index)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRoleDelete(role.name)}
                      >
                        <FiTrash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className="sm:max-w-md dark:bg-gray-800"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editingRoleIndex !== null ? "Edit" : "Create"} User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateOrUpdateRole)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormField
                  label="Name"
                  {...register('name')}
                  placeholder="User Name"
                  className="dark:bg-gray-700"
                  error={errors.name?.message}
                />
              </div>
              <PermissionsTable
                permissions={watch("permissions")}
                onCheckboxChange={(category, type) =>
                  handleCheckboxChange(
                    category,
                    type,
                    !watch(`permissions.${category}.${type}`)
                  )
                }
              />

              <div className="flex justify-end space-x-2">
                <Button variant="destructive" onClick={closeModal}>
                  Close
                </Button>
                <Button type="submit" className="bg-green-600">
                  Save & Update
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTable;