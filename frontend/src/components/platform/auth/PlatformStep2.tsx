import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { api } from '@/lib/api';
import { platformAdminEndpoint } from '@/lib/endpoint';
import { ApiError, ValidateOTPProps } from '@/shared/types/app';
import { KeyIcon } from 'lucide-react';
import { IoMdArrowRoundBack } from 'react-icons/io';

async function validateOtp(url: string, { arg }: { arg: { email: string; otp: string } }) {
  const response = await api.post(url, arg);
  return response;
}

async function validateEmail(url: string, { arg }: { arg: { email: string } }) {
  const response = await api.post(url, arg);
  return response;
}

const PlatformStep2: React.FC<ValidateOTPProps> = ({ onNext, onPrevious, setOtp, email }) => {
  const { trigger: triggerValidateOtp, isMutating } = useSWRMutation(
    platformAdminEndpoint.VALIDATE_OTP,
    validateOtp
  );
  const { trigger: triggerResendOtp } = useSWRMutation(platformAdminEndpoint.VALIDATE_EMAIL, validateEmail);
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (otpValue.length < 4) {
      toast.error('Please enter a valid OTP');
      setIsLoading(false);
      return;
    }

    try {
      const response = await triggerValidateOtp({ email, otp: otpValue });
      if (!response.success) {
        throw new Error(response.message || 'Failed to validate OTP');
      }
      setOtp(otpValue);
      toast.success('OTP verified successfully');
      onNext();
    } catch (error) {
      console.error('Error validating OTP:', error);
      const apiError = error as ApiError;
      toast.error(
        (typeof apiError === 'object' && apiError !== null && apiError.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Failed to validate OTP'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    let timer = 30;
    setCountdown(timer);

    try {
      const response = await triggerResendOtp({ email });
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend OTP');
      }
      toast.success('New OTP sent successfully');

      const interval = setInterval(() => {
        timer -= 1;
        setCountdown(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setResendDisabled(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error resending OTP:', error);
      const apiError = error as ApiError;
      toast.error(
        (typeof apiError === 'object' && apiError !== null && apiError.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Failed to resend OTP'
      );
      setResendDisabled(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-slate-900 dark:text-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <KeyIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-slate-900 dark:text-slate-100">
          Verify Your Email
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="otp" className="text-base font-medium text-slate-900 dark:text-slate-200">
            Verification Code
          </Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter the 6-digit code"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            required
            autoFocus
            className="h-12 px-4 text-center text-xl tracking-widest bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
            We have sent a verification code to{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onPrevious}
            className="w-full text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          >
            <IoMdArrowRoundBack />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendOTP}
            disabled={resendDisabled}
            className="h-11 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isMutating}
            className="w-full text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          >
            {isLoading || isMutating ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlatformStep2;
