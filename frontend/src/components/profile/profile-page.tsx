'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/form/button';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import { FormField } from '@/components/common/form-field';
import { useAuthStore } from '@/store/authStore';
import { api, isAxiosError } from '@/lib/api';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useProfileStore } from '@/store/profileStore';
import { userEndpoint } from '@/lib/endpoint';
import PasswordRequirements from '@/components/profile/PasswordRequirements';
import { emailRegex, passwordRegex } from '@/shared/constants/data';

const userInfoSchema = z.object({
  userName: z.string().min(1, 'User Name is required').max(25, 'User Name must be at most 25 characters'),
  email: z.string().regex(emailRegex,"Invalid email format.")
});

const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old Password is required'),
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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('emailPassword');
  const { isEditing, setIsEditing } = useProfileStore();
  const { user } = useAuthStore();

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    reNew: false,
  });
  const togglePassword = (type: 'old' | 'new' | 'reNew') => {
    setShowPassword((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const {
    register: registerUserInfo,
    handleSubmit: handleUserInfoSubmit,
    formState: { errors: userInfoErrors },
    reset: userReset,
    setValue
  } = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      userName: user?.name || '',
      email: user?.email || '',
    },
  });
  
  useEffect(() => {
    if (user) {
      setValue('userName', user.name || '');
      setValue('email', user.email || '');
    }
  }, [user]);

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
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      reNewPassword: '',
    },
  });

  // Watch the password field to update validation in real-time
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'newPassword') {
        setNewPassword(value.newPassword || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSaveUserInfo = async (data: { userName: string; email: string }) => {
    try {
      if (user?.id) {
        const res = await api.put(`${userEndpoint.USER_BY_ID}/${user?.id}`, {
          name: data.userName,
          email: data.email,
        });
        if (res.success) {
          toast.success('User Info Updated Successfully');
          // Update the form with the returned data
          userReset({
            userName: res.data.name,
            email: res.data.email,
          });
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
      if (user?.id) {
        const res = await api.put(`${userEndpoint.CHANGE_PASSWORD}/${user?.id}`, {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        });
        if (res.success) {
          toast.success('Password Updated Successfully');
          passwordReset();
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
          User Profile
        </h1>
        <div className="max-w-4xl mx-auto p-7 bg-white dark:bg-gray-700 m-4 rounded-lg shadow-md">
          {/* Tabs */}
          <div className="flex border-b dark:border-gray-600 bg">
            <button
              className={`px-4 py-2 ${
                activeTab === 'emailPassword'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('emailPassword')}
            >
              Email and Password
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'changePassword'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('changePassword')}
            >
              Change Password
            </button>
          </div>

          {/* Tab Panels */}
          {activeTab === 'emailPassword' && (
            <div className="mt-4">
              <ProfilePictureUpload imageUrl={user?.image || ''} />
              <div className="space-y-4 mb-4 mt-4">
                <form onSubmit={handleUserInfoSubmit(onSaveUserInfo)}>
                  <div className="pb-4 dark:border-gray-700">
                    <FormField
                      label="User Name"
                      {...registerUserInfo('userName')}
                      className="w-full mt-2 dark:bg-gray-800 dark:text-white"
                      error={userInfoErrors.userName?.message}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="pb-2 dark:border-gray-700">
                    <FormField
                      label="Email"
                      {...registerUserInfo('email')}
                      className="w-full mt-2 dark:bg-gray-800 dark:text-white"
                      // error={userInfoErrors.email?.message}
                      disabled={!isEditing}
                    />
                    {userInfoErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{userInfoErrors.email.message}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 mt-4"
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
                    className="w-full dark:bg-gray-800 dark:text-white"
                    error={passwordErrors.oldPassword?.message}
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
                    className="w-full dark:bg-gray-800 dark:text-white"
                    onFocus={() => setShowPasswordRequirements(true)}
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
                    className="w-full dark:bg-gray-800 dark:text-white"
                    error={passwordErrors.reNewPassword?.message}
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
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 mt-4"
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
