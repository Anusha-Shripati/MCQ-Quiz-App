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

const EnterEmail: React.FC<EnterEmailProps> = ({ onNext, setEmail }) => {
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
    <div className="max-w-md mx-auto text-gray-900 dark:text-gray-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <MailIcon className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          Enter Your Email
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-gray-200">
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
            className="h-12 px-4 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 focus:border-gray-400 dark:focus:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
          />
          <div className="flex justify-between text-sm">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full text-lg bg-black dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
          disabled={isMutating}
        >
          {isMutating ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </form>
    </div>
  );
};

export default EnterEmail;
