'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { FormField } from '@/components/common/form-field';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { api, isAxiosError } from '@/lib/api';
import axios from '@/components/Axios';
import { tenantRequestEndpoint } from '@/lib/endpoint';

interface RequestStatus {
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  organization_name: string;
  slug: string;
  rejection_reason?: string;
  tenant_id?: string;
}

const statusSchema = z.object({
  admin_email: z.string().email('Invalid email address.'),
  admin_password: z.string().min(1, 'Password is required.'),
});

export default function RequestStatusPage() {
  const [status, setStatus] = useState<RequestStatus | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof statusSchema>>({
    defaultValues: { admin_email: '', admin_password: '' },
    resolver: zodResolver(statusSchema),
  });

  const checkStatus = async (data: z.infer<typeof statusSchema>) => {
    try {
      const response = await api.post(tenantRequestEndpoint.STATUS, data);
      
      if (response.success) {
        setStatus(response.data);
        toast.success('Status retrieved successfully');
        
        // If approved, redirect to tenant login after 3 seconds
        if (response.data.status === 'approved') {
          setTimeout(() => {
            const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'lr-mcq.com';
            window.location.href = `https://${response.data.slug}.${baseDomain}/login`;
          }, 5000);
        }
      } else {
        toast.error(response.message || 'Failed to retrieve status');
        setStatus(null);
      }
    } catch (error) {
      console.error('Status check error:', error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to retrieve status');
      } else {
        toast.error('Something went wrong');
      }
      setStatus(null);
    }
  };

  const cancelRequest = async () => {
    setCancelling(true);
    
    try {
      const credentials = getValues();
      const response = await axios.delete(tenantRequestEndpoint.CANCEL, { data: credentials });
      
      if (response.data.success) {
        setStatus(null);
        toast.success('Request cancelled successfully');
      } else {
        toast.error(response.data.message || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Cancel request error:', error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to cancel request');
      } else {
        toast.error('Failed to cancel request');
      }
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const renderStatus = () => {
    if (!status) return null;

    switch (status.status) {
      case 'pending':
        return (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Request Pending</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your request for "{status.organization_name}" is being reviewed by our team.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    You'll receive an email once your request is processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'processing':
        return (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Request Processing</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your organization "{status.organization_name}" is being set up.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    This may take a few minutes. Please wait...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'approved':
        return (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Request Approved! 🎉</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your organization "{status.organization_name}" has been created successfully.
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Redirecting to your workspace in 5 seconds...
                  </p>
                  <Button 
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white" 
                    size="sm"
                    onClick={() => {
                      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'lr-mcq.com';
                      window.location.href = `https://${status.slug}.${baseDomain}/login`;
                    }}
                  >
                    Go to {status.slug}.lr-mcq.com
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'rejected':
        return (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Request Rejected</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    Your request for "{status.organization_name}" was not approved.
                  </p>
                  {status.rejection_reason && (
                    <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded text-sm text-red-800 dark:text-red-200 mb-3">
                      <strong>Reason:</strong> {status.rejection_reason}
                    </div>
                  )}
                  <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium mb-1">Need Help?</p>
                    <p>Please contact our support team for further assistance with your request.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-900 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute top-5 right-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[650px] space-y-6">
        <Card className="shadow-xl overflow-hidden make dark:bg-background text-gray-900 dark:text-gray-200 dark:border-border">
          <div className="bg-white dark:bg-primary p-5 border-b border-gray-700 dark:border-border flex items-center justify-center">
            <h2 className="text-3xl font-semibold">Welcome To MCQ APP</h2>
          </div>

          <div className="p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
                Check Request Status
              </CardTitle>
              <CardDescription className="text-base text-center text-gray-500 dark:text-gray-400">
                Enter your credentials to check your organization request status
              </CardDescription>
            </CardHeader>

            <CardContent className="px-12 pb-2">
              <form onSubmit={handleSubmit(checkStatus)}>
                <div className="grid w-full items-center gap-5">
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      label="Email"
                      id="admin_email"
                      type="email"
                      autoFocus
                      placeholder="your@email.com"
                      {...register('admin_email')}
                      className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                      error={errors.admin_email?.message}
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      label="Password"
                      id="admin_password"
                      type="password"
                      placeholder="••••••••"
                      {...register('admin_password')}
                      className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                      error={errors.admin_password?.message}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-lg bg-black dark:bg-primary hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
                  >
                    {isSubmitting ? 'Checking...' : 'Check Status'}
                  </Button>
                  
                  <div className="flex justify-center text-sm mt-4">
                    <span className="text-gray-500 dark:text-gray-400">
                      Don't have a request?{' '}
                      <Link
                        href="/signup"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Request Access
                      </Link>
                    </span>
                  </div>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>

        {renderStatus()}

        {status?.status === 'pending' && (
          <Card className="shadow-xl dark:bg-background dark:border-border">
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={cancelRequest}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}