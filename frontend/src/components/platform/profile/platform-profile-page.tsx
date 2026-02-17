'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/form/button';
import PlatformProfilePictureUpload from '@/components/platform/profile/PlatformProfilePictureUpload';
import { FormField } from '@/components/common/form-field';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import { api, isAxiosError } from '@/lib/api';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useProfileStore } from '@/store/profileStore';
import { platformAdminEndpoint } from '@/lib/endpoint';
import PasswordRequirements from '@/components/profile/PasswordRequirements';
import { emailRegex, passwordRegex } from '@/shared/constants/data';
import { useRouter } from 'next/navigation';

const adminInfoSchema = z.object({
  adminName: z
    .string()
    .min(1, 'Admin Name is required')
    .max(25, 'Admin Name must be at most 25 characters'),
  email: z.string().regex(emailRegex, 'Invalid email format.'),
});

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current Password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(passwordRegex, 'Invalid password format'),
    reNewPassword: z.string().min(1, 'Re-New Password is required'),
  })
  .refine((data) => data.newPassword === data.reNewPassword, {
    message: 'Passwords do not match',
    path: ['reNewPassword'],
  });

export default function PlatformProfilePage() {
  const [activeTab, setActiveTab] = useState('emailPassword');
  const { isEditing, setIsEditing } = useProfileStore();
  const { platformAdmin } = usePlatformAuthStore();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState({ old: false, new: false, reNew: false });
  const togglePassword = (type: 'old' | 'new' | 'reNew') => {
    setShowPassword((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const {
    register: registerAdminInfo,
    handleSubmit: handleAdminInfoSubmit,
    formState: { errors: adminInfoErrors },
    reset: adminReset,
    setValue,
  } = useForm({
    resolver: zodResolver(adminInfoSchema),
    defaultValues: { adminName: platformAdmin?.name || '', email: platformAdmin?.email || '' },
  });

  useEffect(() => {
    if (platformAdmin) {
      setValue('adminName', platformAdmin.name || '');
      setValue('email', platformAdmin.email || '');
    }
  }, [platformAdmin]);

  const [newPassword, setNewPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: passwordReset,
    watch,
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { oldPassword: '', newPassword: '', reNewPassword: '' },
  });

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'newPassword') {
        setNewPassword(value.newPassword || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSaveAdminInfo = async (data: { adminName: string; email: string }) => {
    try {
      if (platformAdmin?.id) {
        const res = await api.put(`${platformAdminEndpoint.ADMIN_BY_ID}/${platformAdmin?.id}`, {
          name: data.adminName,
          email: data.email,
        });
        if (res.success) {
          toast.success('Admin Info Updated Successfully');
          adminReset({ adminName: res.data.name, email: res.data.email });
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsEditing(false);
    }
  };

  const onChangePassword = async (data: {
    oldPassword: string;
    newPassword: string;
    reNewPassword: string;
  }) => {
    try {
      if (platformAdmin?.id) {
        const res = await api.put(`${platformAdminEndpoint.CHANGE_PASSWORD}/${platformAdmin?.id}`, {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        });
        if (res.success) {
          toast.success('Password has been changed successfully. Kindly login with the new password.');
          passwordReset();
          const { logout } = usePlatformAuthStore.getState();
          logout();
          router.push('/platform-auth/login');
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <>
      <div className="mt-11 mb-16 p-4 h-[65vh]">
        <h1 className="text-3xl font-bold mb-8 dark:text-white flex align-center justify-center">
          Platform Admin Profile
        </h1>
        <div className="max-w-4xl mx-auto p-7 bg-white dark:bg-secondary m-4 rounded-lg shadow-md">
          <div className="flex border-b dark:border-gray-600 bg">
            <button
              className={`px-4 py-2 ${
                activeTab === 'emailPassword'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('emailPassword')}
            >
              Email and Password
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'changePassword'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('changePassword')}
            >
              Change Password
            </button>
          </div>

          {activeTab === 'emailPassword' && (
            <div className="mt-4">
              <PlatformProfilePictureUpload imageUrl={platformAdmin?.image || ''} />
              <div className="space-y-4 mb-4 mt-4">
                <form onSubmit={handleAdminInfoSubmit(onSaveAdminInfo)}>
                  <div className="pb-4 dark:border-border">
                    <FormField
                      label="Admin Name"
                      {...registerAdminInfo('adminName')}
                      className="w-full mt-2 dark:bg-primary dark:text-white"
                      error={adminInfoErrors.adminName?.message}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="pb-2 dark:border-border">
                    <FormField
                      label="Email"
                      {...registerAdminInfo('email')}
                      className="w-full mt-2 dark:bg-primary dark:text-white"
                      disabled={!isEditing}
                    />
                    {adminInfoErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{adminInfoErrors.email.message}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 mt-4"
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {activeTab === 'changePassword' && (
            <div className="mt-10">
              <form className="space-y-4" onSubmit={handlePasswordSubmit(onChangePassword)}>
                <div className="relative">
                  <FormField
                    type={showPassword.old ? 'text' : 'password'}
                    label="Current Password"
                    {...registerPassword('oldPassword')}
                    className="w-full dark:bg-primary dark:text-white"
                    error={passwordErrors.oldPassword?.message}
                    autoComplete={'off'}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('old')}
                    className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword.old ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <FormField
                    label="New Password"
                    type={showPassword.new ? 'text' : 'password'}
                    {...registerPassword('newPassword')}
                    className="w-full dark:bg-primary dark:text-white"
                    onFocus={() => setShowPasswordRequirements(true)}
                    autoComplete={'off'}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('new')}
                    className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword.new ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                  {showPasswordRequirements && <PasswordRequirements password={newPassword} />}
                </div>

                <div className="relative">
                  <FormField
                    type={showPassword.reNew ? 'text' : 'password'}
                    label="Re-New Password"
                    {...registerPassword('reNewPassword')}
                    className="w-full dark:bg-primary dark:text-white"
                    error={passwordErrors.reNewPassword?.message}
                    autoComplete={'off'}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('reNew')}
                    className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword.reNew ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 mt-4"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
