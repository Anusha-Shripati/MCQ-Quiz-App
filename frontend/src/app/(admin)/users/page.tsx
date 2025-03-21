"use client"
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const availableModules = ['assessment', 'candidates', 'questions'];

type Permission = {
  createEdit: boolean;
  view: boolean;
  delete: boolean;
};

type UserPermissions = Record<string, Permission>;

const UserTable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [users, setUsers] = useState([
    {
      name: 'Mihir T',
      email: 'Mihir@logicrays.com',
      password: 'LRSMihir',
      permissions: {
        assessment: { createEdit: true, view: true, delete: false },
        candidates: { createEdit: true, view: false, delete: true },
      },
    },
    {
      name: 'HR',
      email: 'HR@logicrays.com',
      password: 'LRSHr',
      permissions: {
        assessment: { createEdit: true, view: true, delete: true },
        candidates: { createEdit: false, view: true, delete: true },
      },
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    permissions: {
      assessment: { createEdit: false, view: false, delete: false },
      candidates: { createEdit: false, view: false, delete: false }
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: keyof typeof availableModules, type: string) => {
    setNewUser((prev) => {
      const updatedPermissions = {
        ...(prev.permissions as UserPermissions),
        [category]: {
          ...(prev.permissions[category as keyof typeof prev.permissions] as Permission || {}),
          [type as keyof Permission]: !prev.permissions[category as keyof typeof prev.permissions]?.[type as keyof Permission]
        }
      };

      if (
        !(updatedPermissions[category as keyof typeof updatedPermissions]?.createEdit) &&
        !(updatedPermissions[category as keyof typeof updatedPermissions]?.view) &&
        !(updatedPermissions[category as keyof typeof updatedPermissions]?.delete)
      ) {
        delete updatedPermissions[category as keyof typeof updatedPermissions];
      }

      return { ...prev, permissions: updatedPermissions };
    });
  };

  const validateUser = () => {
    const { name, email } = newUser;

    if (!name.trim() || !email.trim()) {
      setIsDisabled(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsDisabled(true);
      return;
    }

    setIsDisabled(false);
  };

  useEffect(() => {
    validateUser();
  }, [users, newUser]);

  const handleCreateOrUpdateUser = () => {
    const isDuplicate = users.some(user => user.email === newUser.email);

    if (isDuplicate && editingUser === null) {
      toast.error("User with this email already exists!");
      return;
    }

    if (editingUser !== null) {
      const updatedUsers = [...users];
      updatedUsers[editingUser] = newUser;
      setUsers(updatedUsers);
    } else {
      setUsers([...users, newUser]);
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      password: '',
      permissions: {
        assessment: { createEdit: false, view: false, delete: false },
        candidates: { createEdit: false, view: false, delete: false }
      }
    });
  };

  const handleEditUser = (index: number) => {
    setNewUser(users[index]);
    setEditingUser(index);
    setIsModalOpen(true);
  };

  const handleUserDelete = (email: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.email !== email));
      toast.success("User deleted successfully");
    }
  };

  const resetNewUser = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      permissions: {
        assessment: { createEdit: false, view: false, delete: false },
        candidates: { createEdit: false, view: false, delete: false }
      }
    });
    setConfirmPassword("");
  };

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
            <Button onClick={() => {
              setIsModalOpen(true)
              resetNewUser()
              }}>Create User</Button>
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
              {users
                .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.password}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(user.permissions)
                          .filter((module): module is keyof typeof user.permissions =>
                            Object.values(user.permissions[module as keyof typeof user.permissions]).some(Boolean)
                          )
                          .map((module) => (
                            <Badge key={module} variant="default" className='dark:bg-gray-500 dark:text-white'>
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
                          onClick={() => {
                            handleUserDelete(user.email)
                          }}
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

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          resetNewUser();
          setEditingUser(null);
        }
        setIsModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>{editingUser !== null ? 'Edit' : 'Create'} User</DialogTitle>
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
                className='dark:bg-gray-700'
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
                className='dark:bg-gray-700'
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
                className='dark:bg-gray-700'
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
                className='dark:bg-gray-700'
              />
              {confirmPassword && newUser.password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match!</p>
              )}
            </div>

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
                    {['createEdit', 'view', 'delete'].map((type) => (
                      <TableCell key={type} className="text-center">
                        <Checkbox
                          checked={newUser.permissions[category]?.[type] || false}
                          onCheckedChange={() => handleCheckboxChange(category as keyof typeof availableModules, type)}
                          className='dark:bg-gray-600'
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={handleCreateOrUpdateUser}
                disabled={isDisabled || newUser.password !== confirmPassword}
                className='bg-green-600'
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

export default UserTable;