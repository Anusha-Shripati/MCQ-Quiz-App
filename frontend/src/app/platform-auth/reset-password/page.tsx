'use client';

import React, { useEffect, useState } from 'react';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { TypographyH2 } from '@/styles/typography';
import PlatformStep1 from '@/components/platform/auth/PlatformStep1';
import PlatformStep2 from '@/components/platform/auth/PlatformStep2';
import PlatformStep3 from '@/components/platform/auth/PlatformStep3';
import { ThemeToggle } from '@/components/common/theme-toggle';

export default function PlatformResetPasswordPage() {
  const { isAuthenticated } = usePlatformAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/platform/dashboard');
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
        return <PlatformStep1 onNext={handleNext} setEmail={setEmail} />;
      case 2:
        return (
          <PlatformStep2
            onNext={handleNext}
            onPrevious={handlePrevious}
            setOtp={setOtp}
            email={email}
          />
        );
      case 3:
        return <PlatformStep3 onPrevious={handlePrevious} email={email} otp={otp} />;
      default:
        return <PlatformStep1 onNext={handleNext} setEmail={setEmail} />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute top-5 right-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-[700px] shadow-2xl overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <TypographyH2>Reset Platform Admin Password</TypographyH2>
        </div>

        <div className="p-10">
          <div className="mb-12 relative">
            <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-700 z-0">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                style={{ width: `${(currentStep - 1) * 50}%` }}
              />
            </div>

            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-20 shadow-md transition-all duration-300 ${
                    currentStep >= 1
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-400 dark:border-slate-600'
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${
                    currentStep === 1 ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Email
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-20 shadow-md transition-all duration-300 ${
                    currentStep >= 2
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-400 dark:border-slate-600'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${
                    currentStep === 2 ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  OTP
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-20 shadow-md transition-all duration-300 ${
                    currentStep >= 3
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-400 dark:border-slate-600'
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-sm font-medium mt-3 transition-colors duration-300 ${
                    currentStep === 3 ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Password
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 px-4">{renderStepContent()}</div>
        </div>
      </Card>
    </div>
  );
}
