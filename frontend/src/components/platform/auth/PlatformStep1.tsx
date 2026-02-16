import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { validateEmail } from '@/lib/api';
import { ApiError, EnterEmailProps } from '@/shared/types/app';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { MailIcon } from 'lucide-react';
import Link from 'next/link';

const PlatformStep1: React.FC<EnterEmailProps> = ({ onNext, setEmail }) => {
  const [emailValue, setEmailValue] = useState('');
  const { trigger, isMutating } = useSWRMutation(`/user/validate-email`, validateEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const response = await trigger({ email: emailValue });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to validate email');
      }
      setEmail(emailValue);
      toast.success('Email validated successfully');
      onNext();
    } catch (error) {
      console.error('Error validating email:', error);
      const apiError = error as ApiError;
      toast.error(
        (typeof apiError === 'object' && apiError !== null && apiError.response?.data?.message) ||
          'Failed to validate email'
      );
      setEmailValue('');
    }
  };

  return (
    <div className="max-w-md mx-auto text-slate-900 dark:text-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <MailIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-slate-900 dark:text-slate-100">
          Enter Your Email
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base font-medium text-slate-900 dark:text-slate-200">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoFocus
            placeholder="Enter your email address"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            required
            className="h-11 px-4 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <div className="flex justify-between text-sm">
            <Link href="/platform-auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-11 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          disabled={isMutating}
        >
          {isMutating ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </form>
    </div>
  );
};

export default PlatformStep1;
