"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/form/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/form/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/form/label";
import { Checkbox } from "@/components/ui/form/checkbox";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const availableModules = ["assessment", "candidates", "questions"];

type Permission = {
  createEdit: boolean;
  view: boolean;
  delete: boolean;
};

type User = {
  name: string;
  email: string;
  password: string;
  permissions: Record<string, Permission>;
};

const defaultPermissions = availableModules.reduce((acc, module) => {
  acc[module] = { createEdit: false, view: false, delete: false };
  return acc;
}, {} as Record<string, Permission>);

const defaultUser: User = {
  name: "",
  email: "",
  password: "",
  permissions: defaultPermissions,
};

const UserTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      name: "Mihir T",
      email: "Mihir@logicrays.com",
      password: "LRSMihir",
      permissions: {
        assessment: { createEdit: true, view: true, delete: false },
        candidates: { createEdit: true, view: false, delete: true },
      },
    },
    {
      name: "HR",
      email: "HR@logicrays.com",
      password: "LRSHr",
      permissions: {
        assessment: { createEdit: true, view: true, delete: true },
        candidates: { createEdit: false, view: true, delete: true },
      },
    },
  ]);
  const [newUser, setNewUser] = useState<User>(defaultUser);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: string, type: keyof Permission) => {
    setNewUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category],
          [type]: !prev.permissions[category][type],
        },
      },
    }));
  };

  const validateUser = () => {
    const { name, email } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return name.trim() && emailRegex.test(email);
  };

  const handleCreateOrUpdateUser = () => {
    if (editingUserIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[editingUserIndex] = newUser;
      setUsers(updatedUsers);
    } else {
      if (users.some((user) => user.email === newUser.email)) {
        toast.error("User with this email already exists!");
        return;
      }
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleEditUser = (index: number) => {
    setNewUser(users[index]);
    setEditingUserIndex(index);
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
    setNewUser(defaultUser);
    setConfirmPassword("");
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">All Users ({users.length})</CardTitle>
          <div className="flex space-x-4 items-center">
            <Input
              type="text"
              placeholder="Search Users..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <Button onClick={() => setIsModalOpen(true)}>Create User</Button>
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
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(index)}>
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
        <DialogContent className="sm:max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>{editingUserIndex !== null ? "Edit" : "Create"} User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                placeholder="User Name"
                className="dark:bg-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="dark:bg-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="dark:bg-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="dark:bg-gray-700"
              />
              {confirmPassword && newUser.password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match!</p>
              )}
            </div>

            <PermissionsTable
              permissions={newUser.permissions}
              onCheckboxChange={handleCheckboxChange}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={closeModal}>
                Close
              </Button>
              <Button
                onClick={handleCreateOrUpdateUser}
                disabled={!validateUser() || newUser.password !== confirmPassword}
                className="bg-green-600"
              >
                Save & Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PermissionsTable: React.FC<{
  permissions: Record<string, Permission>;
  onCheckboxChange: (category: string, type: keyof Permission) => void;
}> = ({ permissions, onCheckboxChange }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Module</TableHead>
        <TableHead className="text-center">Create/Edit</TableHead>
        <TableHead className="text-center">View</TableHead>
        <TableHead className="text-center">Delete</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {availableModules.map((category) => (
        <TableRow key={category}>
          <TableCell>{category}</TableCell>
          {["createEdit", "view", "delete"].map((type) => (
            <TableCell key={type} className="text-center">
              <Checkbox
                checked={permissions[category]?.[type as keyof Permission] || false}
                onCheckedChange={() => onCheckboxChange(category, type as keyof Permission)}
                className="dark:bg-gray-600"
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default UserTable;
