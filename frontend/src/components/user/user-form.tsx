import { api, isAxiosError } from '@/lib/api';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { FormField } from '../common/form-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Role } from '@/types/common.types';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '../ui/form/button';
import { UserData } from '@/types/common.types';
import useSWRMutation from 'swr/mutation';
import RoleForm from '../roles/role-form';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { roleEndpoint, userEndpoint } from '@/lib/endpoint';
import { passwordRegex } from '@/shared/constants/data';
import PasswordRequirements from '@/components/profile/PasswordRequirements';

const userSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Match the below password requirements.')
      .regex(passwordRegex, 'Invalid password format')
      .nullable(),
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must match Password.')
      .nullable(),
    role: z.string().min(1, 'Role is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type UserFormValues = {
  name: string;
  email: string;
  password: string | null;
  confirmPassword: string | null;
  role: string;
};

const defaultUser: UserFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
};

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  userData?: UserData | null;
}

async function create(url: string, { arg }: { arg: Partial<UserFormValues> }) {
  const response = await api.post(url, arg);
  return response;
}
async function update(url: string, { arg }: { arg: Partial<UserFormValues> }) {
  const response = await api.put(url, arg);
  return response;
}
function UserForm({ open, onClose, userData = null }: UserFormProps) {
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
  const [openRoleForm, setOpenRole] = useState(false);
  const [passwordChange, setPasswordChange] = useState(false);
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const [passchange, setPassChange] = useState('');
  const [isBlank, setIsBlank] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const togglePassword = (name: keyof typeof showPassword) =>
    setShowPassword((prv) => ({ ...prv, [name]: !prv[name] }));

  const userFoms = watch();

  const { data: roles } = useSWR(roleEndpoint.LIST, api.get);

  const { trigger, isMutating } = useSWRMutation(userEndpoint.CREATE, create);
  const { trigger: updateTrigger, isMutating: updating } = useSWRMutation(
    `/user/${userData?.id}`,
    update
  );

  const rolesOptions = useMemo(() => {
    if (roles?.data?.list) {
      return roles.data.list.map((item: Role) => ({ value: item.id, label: item.name }));
    }
  }, [roles]);

  const handleCreateOrUpdateUser = async (data: UserFormValues) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role_id: data.role,
    };
    try {
      let res;

      if (userData) {
        res = await updateTrigger(payload);
      } else {
        res = await trigger(payload);
      }
      if (res.success) {
        toast.success(userData ? 'User updated successfully' : 'User created successfully');
        mutate((key) => typeof key === 'string' && key.startsWith('/user/list'));
      } else {
        toast.error(res.message);
      }
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleClose = () => {
    reset(defaultUser);
    onClose();
  };

  useEffect(() => {
    if (open) {
      const formData = {
        name: userData?.name || '',
        email: userData?.email || '',
        password: null,
        confirmPassword: null,
        role: userData?.role?.id || '',
      };
      reset(formData);
      setPasswordChange(userData ? false : true);
    }
  }, [open, reset, userData]);

  useEffect(() => {
    if (passchange.length > 0) {
      console.log('Password changed:', passchange);
      setIsBlank(false);
    } else {
      setPassChange('');
      setIsBlank(true);
    }
  }, [passchange]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>{userData !== null ? 'Edit' : 'Create'} User</DialogTitle>
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
            <div className="space-y-2 ">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <FormField
                    onChange={(e) => setValue('role', e)}
                    type="select"
                    value={userFoms.role}
                    label="Role"
                    className="dark:bg-gray-700"
                    options={rolesOptions}
                  />
                </div>

                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" type="button" onClick={() => setOpenRole(true)}>
                      +
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                    Create a new role
                  </TooltipContent>
                </Tooltip>
              </div>
              {errors.role?.message && (
                <p className="text-red-500 text-sm mt-1">{errors.role?.message}</p>
              )}
            </div>
            {userData && (
              <div className="space-y-2">
                <input
                  type="checkbox"
                  className="h-3"
                  onChange={(e) => setPasswordChange(e.target.checked)}
                />{' '}
                Change password ?
              </div>
            )}
            {passwordChange && (
              <>
                <div className="space-y-2 relative">
                  <FormField
                    label="Password"
                    {...register('password')}
                    placeholder="Password"
                    className="dark:bg-gray-700"
                    type={showPassword.password ? 'text' : 'password'}
                    error={errors.password?.message}
                    onChange={(e) => {
                      setPassChange(e.target.value);
                    }}
                    onFocus={() => setShowPasswordRequirements(true)}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('password')}
                    className="absolute right-3 top-[34px] transform -translate-y-1/2 text-gray-400 "
                  >
                    {showPassword.password ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                  {showPasswordRequirements && <PasswordRequirements password={passchange} />}
                </div>
                <div className="space-y-2 relative">
                  <FormField
                    label="Confirm Password"
                    {...register('confirmPassword')}
                    placeholder="Confirm Password"
                    className="dark:bg-gray-700"
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    error={errors.confirmPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('confirmPassword')}
                    className="absolute right-3 top-[34px] transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOffIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </button>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="reset"
                variant="destructive"
                onClick={handleClose}
                disabled={isMutating || updating}
              >
                Close
              </Button>
              <Button
                type="submit"
                className="bg-green-600"
                disabled={isMutating || updating || (isBlank && passwordChange)}
              >
                {userData ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
      <RoleForm open={openRoleForm} onClose={() => setOpenRole(false)} />
    </Dialog>
  );
}

export default UserForm;
