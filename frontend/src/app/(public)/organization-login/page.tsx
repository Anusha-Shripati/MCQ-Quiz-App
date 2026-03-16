'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { FormField } from '@/components/common/form-field';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { api, isAxiosError } from '@/lib/api';
import { tenantRequestEndpoint } from '@/lib/endpoint';

const loginSchema = z.object({
  slug: z.string().min(2, 'Organization domain must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed.'),
});

export default function OrganizationLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    defaultValues: { slug: '' },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const response = await api.post(tenantRequestEndpoint.CHECK_ORGANIZATION, { slug: data.slug });
      
      if (response.success) {
        const { tenant, request } = response.data;
        
        // Case 1: Tenant exists - redirect to subdomain regardless of status
        if (tenant.exists) {
          const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'lr-mcq.com';
          const protocol = window.location.protocol;
          window.location.href = `${protocol}//${data.slug}.${baseDomain}/login`;
          return;
        }
        
        // Case 2: Tenant doesn't exist but request exists
        if (request) {
          switch (request.status) {
            case 'pending':
              toast.error(`Request Status: Pending\n\nYour request for "${request.organization_name}" is being reviewed by our team. You'll receive an email once it's approved.`, {
                duration: 6000
              });
              break;
              
            case 'processing':
              toast.error(`Request Status: Processing\n\nYour request for "${request.organization_name}" is currently being processed. Please wait while we set up your organization.`, {
                duration: 6000
              });
              break;
              
            case 'approved':
              toast.error(`Request Status: Approved\n\nYour request has been approved but the organization setup is not complete. Please contact support for assistance.`, {
                duration: 8000
              });
              break;
              
            case 'rejected':
              toast.error(`Request Status: Rejected\n\nYour request for "${request.organization_name}" has been rejected. Please contact our support team for further assistance.`, {
                duration: 6000
              });
              break;
              
            default:
              toast.error(`Request found but status is unclear. Please contact support.`, {
                duration: 5000
              });
          }
        } else {
          // Case 3: No tenant and no request found
          toast.error(`Organization "${data.slug}" not found.\n\nIf you don't have an organization yet, you can request access using the link below.`, {
            duration: 6000
          });
        }
      }
    } catch (error) {
      console.error('Organization check error:', error);
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to check organization';
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-900 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute top-5 right-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-[650px] shadow-xl overflow-hidden make dark:bg-background text-gray-900 dark:text-gray-200 dark:border-border">
        <div className="bg-white dark:bg-primary p-5 border-b border-gray-700 dark:border-border flex items-center justify-center">
          <h2 className="text-3xl font-semibold">Welcome To MCQ APP</h2>
        </div>

        <div className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
              Organization Login
            </CardTitle>
            <CardDescription className="text-base text-center text-gray-500 dark:text-gray-400">
              Enter your organization domain to continue to your workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="px-12 pb-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-5">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    label="Organization Domain"
                    id="slug"
                    autoFocus
                    placeholder="your-organization"
                    {...register('slug')}
                    className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.slug?.message}
                    onChange={(value) => {
                      const val = typeof value === 'string' ? value : value.target.value;
                      const cleanSlug = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setValue('slug', cleanSlug);
                    }}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This will redirect you to your organization's login page
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full text-lg bg-black dark:bg-primary hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
                >
                  {isSubmitting || isLoading ? 'Checking...' : 'Continue'}
                </Button>
                
                <div className="flex justify-center items-center text-sm mt-4 gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Don't have an organization?{' '}
                    <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Request Access
                    </Link>
                  </span>
                </div>
                <div className="flex justify-center text-xs mt-2">
                  <span className="text-gray-400 dark:text-gray-500">
                    Submitted a request?{' '}
                    <Link href="/request-status" className="text-blue-500 dark:text-blue-400 hover:underline">
                      Check status
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}