import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { api } from '@/lib/api';
import { platformAdminEndpoint } from '@/lib/endpoint';
import { ApiError, NewPasswordProps } from '@/shared/types/app';
import { passwordRegex } from '@/shared/constants/data';
import PasswordRequirements from '@/components/profile/PasswordRequirements';

async function resetPassword(url: string, { arg }: { arg: { email: string; newPassword: string; confirmPassword: string } }) {
  const response = await api.post(url, arg);
  return response;
}

const PlatformStep3: React.FC<NewPasswordProps> = ({ email }) => {
  const { trigger, isMutating } = useSWRMutation(platformAdminEndpoint.RESET_PASSWORD, resetPassword);
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
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
      toast.success('Password reset successfully');
      router.push('/platform-auth/login');
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
    <div className="max-w-md mx-auto text-slate-900 dark:text-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <LockIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-slate-900 dark:text-slate-100">
          Create New Password
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Label
            htmlFor="new-password"
            className="text-base font-medium text-slate-900 dark:text-slate-200"
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
              className="h-12 pr-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:bg-transparent"
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
            className="text-base font-medium text-slate-900 dark:text-slate-200"
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
              className="h-12 pr-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:bg-transparent"
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
            className="w-full text-lg h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          >
            {isLoading || isMutating ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlatformStep3;
