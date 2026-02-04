import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { resetPassword } from '@/lib/api';
import { ApiError, NewPasswordProps } from '@/shared/types/app';
import { passwordRegex } from '@/shared/constants/data';
import PasswordRequirements from '@/components/profile/PasswordRequirements';

const NewPassword: React.FC<NewPasswordProps> = ({ email }) => {
  const { trigger, isMutating } = useSWRMutation('/user/reset-password', resetPassword);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password against the regex pattern
    if (!passwordRegex.test(password)) {
      toast.error('Password must meet all requirements');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      const response = await trigger({ email, newPassword: password, confirmPassword });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
      toast.success('Password reset successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error resetting password:', error);
      const apiError = error as ApiError;
      toast.error(
        (typeof apiError === 'object' && apiError !== null && apiError.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Failed to reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-gray-900 dark:text-gray-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
          <LockIcon className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          Create New Password
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Label
            htmlFor="new-password"
            className="text-base font-medium text-gray-900 dark:text-gray-200"
          >
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              required
              autoFocus
              autoComplete={'off'}
              className="h-12 pr-12 bg-gray-100 dark:bg-primary border-gray-300 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 focus:border-gray-400 dark:focus:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </Button>
          </div>
          {showPasswordRequirements && <PasswordRequirements password={password} />}
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="confirm-password"
            className="text-base font-medium text-gray-900 dark:text-gray-200"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete={'off'}
              className="h-12 pr-12 bg-gray-100 dark:bg-primary border-gray-300 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 focus:border-gray-400 dark:focus:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </Button>
          </div>
        </div>

        <div className="flex justify-between space-x-4 pt-4 w-full">
          <Button
            type="submit"
            disabled={isLoading || isMutating}
            className="w-full text-lg bg-black dark:bg-primary hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
          >
            {isLoading || isMutating ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewPassword;
