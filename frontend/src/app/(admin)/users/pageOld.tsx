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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import useSWR from "swr";
import { deleteData, fetcher, isAxiosError, postData } from "@/lib/api";
import Loading from "@/app/loading";
import Error from "@/app/error";
import { Role, UserData } from "@/types/common.types";


const userSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().min(6, "Confirm Password must match Password").optional(),
    role: z.string().min(1, "Role is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordChange, setPasswordChange] = useState(false)
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });

  const { data: users, isLoading, error, mutate } = useSWR('/user/list', fetcher)
  const { data: roles } = useSWR('/role/list', fetcher)
  
  const rolesOptions = useMemo(() => {
    if (roles?.data?.list) {
      return roles.data.list.map((item: Role) => ({ value: item.id, label: item.name }))
    }
  }, [roles])


  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultUser,
  });
  const userFoms = watch()
  const handleCreateOrUpdateUser = async (data: UserFormValues) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: data.role,
    }
    try {
      if (editingUserId !== null) {
        const res = await postData(`/user/${editingUserId}`, payload)
        if (res.sucess) {
          toast.success("User updated successfully");
        } else {
          toast.success(res.message);
        }
      } else {
        const res = await postData('/user/create', payload)
        if (res.sucess) {
          toast.success("User created successfully");
        } else {
          toast.success(res.message);
        }
      }
      mutate()
      closeModal();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || "An unexpected error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleEditUser = (user: UserData) => {
    const { id, role, ...selectedUser } = user
    reset({ ...selectedUser, role: role?.id });
    setEditingUserId(id);
    setIsModalOpen(true);
    setPasswordChange(false)
  };

  const handleCreateUser = () => {
    reset(defaultUser);
    setPasswordChange(true)
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  const handleUserDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await deleteData(`/user/${id}`)
        if (res.success) {
          toast.success("User deleted successfully");
        }
        mutate()
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response.data.message || "An unexpected error occurred");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    reset(defaultUser);
  };

  if (isLoading) {
    return <Loading />
  }
  if (error) {
    return <Error error={error} reset={() => { window.location.reload() }} />
  }

  const togglePassword = (name: keyof typeof showPassword) => setShowPassword((prv) => ({ ...prv, [name]: !prv[name] }));
  return (
    <div className="p-6 min-h-screen">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            All Users ({users?.data?.count || 0})
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
            <Button
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.data?.list && users?.data.list.map((user: UserData, index: number) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role?.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      {user.role?.name !== 'Super Admin' && <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUserDelete(user.id)}
                      >
                        <FiTrash2 className="h-4 w-4 text-destructive" />
                      </Button>}
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
              {editingUserId !== null ? "Edit" : "Create"} User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateOrUpdateUser)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormField
                  label="Name"
                  {...register("name")}
                  placeholder="User Name"
                  className="dark:bg-gray-700"
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  label="Email"
                  {...register("email")}
                  placeholder="Email"
                  className="dark:bg-gray-700"
                  error={errors.email?.message}
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
              {editingUserId && <div className="space-y-2">
                <input type='checkbox' className="h-3" onChange={(e) => setPasswordChange(e.target.checked)} /> Change password ?
              </div>}
              {passwordChange && <>
                <div className="space-y-2 relative">
                  <FormField
                    label="Password"
                    {...register("password")}
                    placeholder="Password"
                    className="dark:bg-gray-700"
                    type={showPassword.password ? "text" : "password"}
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('password')}
                    className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-400 "
                  >
                    {showPassword.password ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
                <div className="space-y-2 relative">
                  <FormField
                    label="Confirm Password"
                    {...register("confirmPassword")}
                    placeholder="Confirm Password"
                    className="dark:bg-gray-700"
                    type={showPassword.confirmPassword ? "text" : "password"}
                    error={errors.confirmPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('confirmPassword')}
                    className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword.confirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
              </>}


              <div className="flex justify-end space-x-2">
                <Button variant="destructive" onClick={closeModal}>
                  Close
                </Button>
                <Button type="submit" className="bg-green-600" disabled={isSubmitting}>
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
