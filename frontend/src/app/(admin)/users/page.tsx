"use client";
import React, { useMemo, useState } from "react";
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
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/common/form-field";
import { rolesDataStatic } from "@/shared/constants/data";


const userSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must match Password"),
    role: z.string().min(1, "Role is required"),
  })

type UserFormValues = z.infer<typeof userSchema>;

const defaultUser: UserFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: '',
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
      role: 'Admin'
    },
    {
      name: "HR",
      email: "HR@logicrays.com",
      password: "LRSHr",
      confirmPassword: "LRSHr",
      role: "LR01"
    },
  ]);


  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultUser,
  });
  const userFoms = watch()
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

  const rolesOptions = useMemo(()=>rolesDataStatic.map(item=>item.name),[rolesDataStatic])

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
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Create User</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.password}</TableCell>
                  <TableCell>{user.role}</TableCell>
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
                <FormField
                  label="Name"
                  {...register('name')}
                  placeholder="User Name"
                  className="dark:bg-gray-700"
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  label="Email"
                  {...register('email')}
                  placeholder="Email"
                  className="dark:bg-gray-700"
                  error={errors.email?.message}
                />
              </div>


              <div className="space-y-2">
                <FormField
                  label="Password"
                  {...register('password')}
                  placeholder="Password"
                  className="dark:bg-gray-700"
                  type="password"
                  error={errors.password?.message}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  label="Confirm Password"
                  {...register('confirmPassword')}
                  placeholder="Confirm Password"

                  className="dark:bg-gray-700"
                  type="password"
                  error={errors.confirmPassword?.message}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  onChange={(e) => setValue('role', e)}
                  type='select'
                  value={userFoms.role}
                  label="Role"
                  className="dark:bg-gray-700"
                  options={rolesOptions}
                  error={errors.role?.message}
                />
              </div>
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
