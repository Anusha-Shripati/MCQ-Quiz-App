"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Label } from "@/components/ui/form/label";
import PermissionsTable from "@/components/users/permission-table";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const availableModules = ["assessment", "candidates", "questions"];

const permissionSchema = z.object({
  createEdit: z.boolean(),
  view: z.boolean(),
  delete: z.boolean(),
});

const userSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must match Password"),
    permissions: z.record(permissionSchema),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserFormValues = z.infer<typeof userSchema>;

const defaultPermissions = availableModules.reduce(
  (acc, module) => {
    acc[module] = { createEdit: false, view: false, delete: false };
    return acc;
  },
  {} as Record<string, z.infer<typeof permissionSchema>>
);

const defaultUser: UserFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  permissions: defaultPermissions,
};

const UserTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserFormValues[]>([
    {
      name: "Mihir T",
      email: "Mihir@logicrays.com",
      password: "LRSMihir",
      confirmPassword: "LRSMihir",
      permissions: {
        ...defaultPermissions,
        assessment: { createEdit: true, view: true, delete: false },
        candidates: { createEdit: true, view: false, delete: true },
      },
    },
    {
      name: "HR",
      email: "HR@logicrays.com",
      password: "LRSHr",
      confirmPassword: "LRSHr",
      permissions: {
        ...defaultPermissions,
        assessment: { createEdit: true, view: true, delete: true },
        candidates: { createEdit: false, view: true, delete: true },
      },
    },
  ]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultUser,
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

  const handleCreateOrUpdateUser = (data: UserFormValues) => {
    if (editingUserIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[editingUserIndex] = data;
      setUsers(updatedUsers);
      toast.success("User updated successfully");
    } else {
      if (users.some((user) => user.email === data.email)) {
        toast.error("Sorry! User with this email already exists!");
      } else {
        setUsers([...users, data]);
        toast.success("User created successfully");
      }
    }
    closeModal();
  };

  const handleEditUser = (index: number) => {
    reset(users[index]);
    setEditingUserIndex(index);
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    reset(defaultUser);
    setEditingUserIndex(null);
    setIsModalOpen(true);
  };

  const handleUserDelete = (email: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.email !== email));
      toast.success("User deleted successfully");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserIndex(null);
    reset(defaultUser);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            All Users ({filteredUsers.length})
          </CardTitle>
          <div className="flex space-x-4 items-center">
            <Input
              type="text"
              placeholder="Search Users..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <Button onClick={handleCreateUser}>Create User</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.password}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(user.permissions)
                        .filter((module) =>
                          Object.values(user.permissions[module]).some(Boolean)
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
                        onClick={() => handleEditUser(index)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUserDelete(user.email)}
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
              {editingUserIndex !== null ? "Edit" : "Create"} User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateOrUpdateUser)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="User Name"
                      className="dark:bg-gray-700"
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Email"
                      className="dark:bg-gray-700"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Password"
                      className="dark:bg-gray-700"
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      className="dark:bg-gray-700"
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
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
