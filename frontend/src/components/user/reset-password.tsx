'use client';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { TypographyH2 } from '@/styles/typography';
import EnterEmail from './Step1';
import ValidateOTP from './Step2';
import NewPassword from './Step3';
import { ThemeToggle } from '@/components/common/theme-toggle';

const ResetPasswordPage = () => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EnterEmail onNext={handleNext} setEmail={setEmail} />;
      case 2:
        return (
          <ValidateOTP
            onNext={handleNext}
            onPrevious={handlePrevious}
            setOtp={setOtp}
            email={email}
          />
        );
      case 3:
        return <NewPassword onPrevious={handlePrevious} email={email} otp={otp} />;
      default:
        return <EnterEmail onNext={handleNext} setEmail={setEmail} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-900 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute top-5 right-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-[650px] shadow-xl overflow-hidden bg-white dark:bg-background text-gray-900 dark:text-gray-200 dark:border-border">
        <div className="bg-white dark:bg-primary p-5 border-b border-gray-700 dark:border-border flex items-center justify-center">
          <TypographyH2>Reset Your Password</TypographyH2>
        </div>

        <div className="p-8">
          <div className="mb-12 relative">
            <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-700 dark:bg-secondary z-0">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${(currentStep - 1) * 50}%` }}
              />
            </div>

            {/* Step circles */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 relative z-20 shadow-md transition-all duration-300 ${
                    currentStep >= 1
                      ? 'bg-black text-gray-100 border-black'
                      : 'bg-gray-300 dark:bg-primary text-gray-400 border-gray-400 dark:border-gray-600'
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${
                    currentStep === 1 ? 'text-green-500' : 'text-gray-400 dark:text-gray-400'
                  }`}
                >
                  Email
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 relative z-20 shadow-md transition-all duration-300 ${
                    currentStep >= 2
                      ? 'bg-black text-gray-100 border-black'
                      : 'bg-gray-100 dark:bg-primary text-red border-red border-black  dark:border-gray-600'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${
                    currentStep === 2 ? 'text-green-500' : 'text-black dark:text-gray-400'
                  }`}
                >
                  OTP
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 relative z-20 shadow-md transition-all duration-300 ${
                    currentStep >= 3
                      ? 'bg-black text-gray-100 border-black'
                      : 'bg-gray-100 dark:bg-primary text-red border-red border-black  dark:border-gray-600'
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${
                    currentStep === 3 ? 'text-green-500' : 'text-black dark:text-gray-400'
                  }`}
                >
                  Password
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 px-4">{renderStepContent()}</div>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
