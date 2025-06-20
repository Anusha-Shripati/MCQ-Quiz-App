'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TypographyH2 } from '@/styles/typography';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { FormField } from '@/components/common/form-field';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function Home() {
  const router = useRouter();


  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // if (err instanceof Error) toast.error(err.message);
      toast.error('The account sign-in details are incorrect. Please try again.');
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-900 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[650px] shadow-xl overflow-hidden bg-gray-900 text-gray-200 border-gray-700">
        <div className="bg-gray-800 p-5 border-b border-gray-700 flex items-center justify-center">
          <TypographyH2>Welcome To MCQ APP</TypographyH2>
        </div>

        <div className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-bold text-center text-gray-100">
              Admin Login
            </CardTitle>
            <CardDescription className="text-base text-center text-gray-400">
              Only users with admin privileges can perform this action.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-12">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-5">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    label="Email"
                    id="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className="h-10 bg-gray-800 border-gray-700 text-gray-200 focus:bg-gray-800 focus:border-gray-600 hover:bg-gray-800 focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.email?.message}
                  />
                </div>
                <div className="flex flex-col space-y-1.5 relative">
                  <FormField
                    label="Password"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="h-10 bg-gray-800 border-gray-700 text-gray-200 focus:bg-gray-800 focus:border-gray-600 hover:bg-gray-800 focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.password?.message}
                  />
                  <Button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 text-gray-400 hover:text-gray-200 top-[37px] transform -translate-y-1/2 bg-transparent border-none shadow-none focus:bg-transparent focus:ring-0"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-4">
                  <Link href="/reset-password" className="text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-lg bg-gray-800 hover:bg-gray-700 text-gray-100 focus:bg-gray-800 focus:ring-1 focus:ring-gray-600"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>

            {/* <div className="text-center mt-6">
              <TypographyH4>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-400 hover:underline">
                  Contact Admin
                </Link>
              </TypographyH4>
            </div> */}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
