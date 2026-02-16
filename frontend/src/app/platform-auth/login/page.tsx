'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { usePlatformAuthStore } from '@/store/platformAuthStore';
import { FormField } from '@/components/common/form-field';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { PlatformThemeToggle } from '@/components/platform/common/PlatformThemeToggle';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function PlatformLogin() {
  const router = useRouter();
  const { login, isAuthenticated } = usePlatformAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/platform/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success('Login successful');
      router.push('/platform/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setValue('password', '');
      toast.error('The account sign-in details are incorrect. Please try again.');
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

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
        <PlatformThemeToggle />
      </div>

      <Card className="w-full max-w-[700px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 border-b border-slate-700 dark:border-slate-700 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-white">Platform Admin Portal</h2>
        </div>

        <div className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-4xl font-bold text-center text-slate-900 dark:text-slate-100">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base text-center text-slate-500 dark:text-slate-400 mt-2">
              Manage tenants, plans, and platform settings
            </CardDescription>
          </CardHeader>

          <CardContent className="px-12 pb-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-6">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    label="Email"
                    id="email"
                    autoFocus
                    placeholder="Enter your email"
                    {...register('email')}
                    className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.email?.message}
                  />
                </div>
                <div className="flex flex-col space-y-1.5 relative">
                  <FormField
                    label="Password"
                    id="password"
                    autoComplete={'off'}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.password?.message}
                  />
                  <Button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 top-[37px] transform -translate-y-1/2 bg-transparent border-none shadow-none focus:bg-transparent focus:ring-0"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-6">
                  <Link
                    href="/platform-auth/reset-password"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-lg h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
