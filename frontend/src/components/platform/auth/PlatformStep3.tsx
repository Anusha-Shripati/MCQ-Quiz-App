import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { resetPassword } from '@/lib/api';
import { ApiError } from '@/shared/types/app';
import { passwordRegex } from '@/shared/constants/data';
import PasswordRequirements from '@/components/profile/PasswordRequirements';
import { IoMdArrowRoundBack } from 'react-icons/io';

interface PlatformStep3Props {
  email: string;
  otp: string;
  onPrevious: () => void;
}

const PlatformStep3: React.FC<PlatformStep3Props> = ({ email, otp, onPrevious }) => {
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
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/platform-auth/login');
      }, 1500);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="new-password" className="text-base font-medium text-slate-900 dark:text-slate-200">
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
              autoComplete="off"
              className="h-11 pr-12 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </Button>
          </div>
          {showPasswordRequirements && <PasswordRequirements password={password} />}
        </div>

        <div className="space-y-3">
          <Label htmlFor="confirm-password" className="text-base font-medium text-slate-900 dark:text-slate-200">
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
              autoComplete="off"
              className="h-11 pr-12 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onPrevious}
            className="h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <IoMdArrowRoundBack />
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isMutating}
            className="flex-1 h-11 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          >
            {isLoading || isMutating ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlatformStep3;
