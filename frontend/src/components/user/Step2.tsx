import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { validateEmail, validateOtp } from '@/lib/api';
import { ApiError, ValidateOTPProps } from '@/shared/types/app';
import { KeyIcon } from 'lucide-react';
import { IoMdArrowRoundBack } from 'react-icons/io';

const ValidateOTP: React.FC<ValidateOTPProps> = ({ onNext, onPrevious, setOtp, email }) => {
  const { trigger: triggerValidateOtp, isMutating } = useSWRMutation(
    '/user/validate-otp',
    validateOtp
  );
  const { trigger: triggerResendOtp } = useSWRMutation('/user/validate-email', validateEmail);
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
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to validate OTP');
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
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to resend OTP');
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
    <div className="max-w-md mx-auto text-gray-900 dark:text-gray-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <KeyIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          Verify Your Email
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="otp" className="text-base font-medium text-gray-900 dark:text-gray-200">
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
            className="h-12 px-4 text-center text-xl tracking-widest bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800 focus:border-gray-400 dark:focus:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            We have sent a verification code to{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onPrevious}
            className="w-full text-lg bg-black dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
          >
            <IoMdArrowRoundBack />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendOTP}
            disabled={resendDisabled}
            className="h-11 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-800"
          >
            {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isMutating}
            className="w-full text-lg bg-black dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
          >
            {isLoading || isMutating ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ValidateOTP;
