'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import toast from 'react-hot-toast';
import { FormField } from '@/components/common/form-field';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api, isAxiosError } from '@/lib/api';
import { tenantRequestEndpoint, platformPlanEndpoint } from '@/lib/endpoint';

// Debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const signupSchema = z.object({
  organization_name: z.string().min(2, 'Organization name must be at least 2 characters.'),
  slug: z.string().min(2, 'Organization URL must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed.'),
  admin_name: z.string().min(2, 'Your name must be at least 2 characters.'),
  admin_email: z.string().email('Invalid email address.'),
  admin_password: z.string().min(6, 'Password must be at least 6 characters.'),
  requested_plan_id: z.string().min(1, 'Please select a plan.'),
});

export default function SignupPage() {
  const router = useRouter();
  const [slugError, setSlugError] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signupSchema>>({
    defaultValues: {
      organization_name: '',
      slug: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      requested_plan_id: '',
    },
    resolver: zodResolver(signupSchema),
  });

  const watchedSlug = watch('slug');

  // Fetch plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get(platformPlanEndpoint.PUBLIC_LIST);
        if (response.success) {
          setPlans(response.data.list || []);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Real-time slug validation
  const checkSlugAvailability = useCallback(
    debounce(async (slug: string) => {
      if (!slug || slug.length < 2) {
        setSlugError('');
        setSlugAvailable(null);
        return;
      }

      setSlugChecking(true);
      try {
        // Use axios directly with skipLoading flag to prevent progress bar
        const response = await api.post(tenantRequestEndpoint.CHECK_SLUG, { slug });
        
        if (response.data.available) {
          setSlugError('');
          setSlugAvailable(true);
        } else {
          setSlugError('This organization name is already taken');
          setSlugAvailable(false);
        }
      } catch (error) {
        console.error('Slug check error:', error);
        setSlugError('Error checking availability');
        setSlugAvailable(false);
      } finally {
        setSlugChecking(false);
      }
    }, 500),
    []
  );

  const handleSlugChange = (value: string | React.ChangeEvent<HTMLInputElement>) => {
    const val = typeof value === 'string' ? value : value.target.value;
    const cleanSlug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setValue('slug', cleanSlug);
    checkSlugAvailability(cleanSlug);
  };

  const handleOrgNameChange = (value: string | React.ChangeEvent<HTMLInputElement>) => {
    const val = typeof value === 'string' ? value : value.target.value;
    setValue('organization_name', val);
    
    // Auto-generate slug
    const autoSlug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setValue('slug', autoSlug);
    checkSlugAvailability(autoSlug);
  };

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      const response = await api.post(tenantRequestEndpoint.CREATE, data);
      
      if (response.success) {
        toast.success('Request submitted successfully! Check your status.');
        router.push('/request-status');
      } else {
        toast.error(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to submit request');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const isFormValid = slugAvailable && !slugChecking && !plansLoading;

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
              Request Access
            </CardTitle>
            <CardDescription className="text-base text-center text-gray-500 dark:text-gray-400">
              Create your organization and get started with MCQ assessments
            </CardDescription>
          </CardHeader>

          <CardContent className="px-12 pb-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-5">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    label="Organization Name"
                    id="organization_name"
                    autoFocus
                    placeholder="Acme Corp"
                    {...register('organization_name')}
                    className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.organization_name?.message}
                    onChange={handleOrgNameChange}
                  />
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <FormField
                        label="Organization URL"
                        id="slug"
                        placeholder="acme-corp"
                        {...register('slug')}
                        className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                        error={errors.slug?.message || slugError}
                        onChange={handleSlugChange}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-6">.{process.env.NEXT_PUBLIC_BASE_DOMAIN || 'lr-mcq.com'}</span>
                    <div className="mt-6">
                      {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                      {slugAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {slugAvailable === false && <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                  
                  {/* {slugChecking && <p className="text-sm text-blue-500">Checking availability...</p>} */}
                  {slugAvailable && <p className="text-sm text-green-500">✓ Available</p>}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <FormField
                    label="Your Name"
                    id="admin_name"
                    placeholder="John Doe"
                    {...register('admin_name')}
                    className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-700 focus-visible:ring-1 focus-visible:ring-offset-0"
                    error={errors.admin_name?.message}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <FormField
                    label="Your Email"
                    id="admin_email"
                    type="email"
                    placeholder="john@acme.com"
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

                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="requested_plan_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Plan
                  </label>
                  <Select
                    onValueChange={(value) => setValue('requested_plan_id', value)}
                    disabled={plansLoading}
                  >
                    <SelectTrigger className="h-10 bg-gray-300 dark:bg-primary border-gray-400 dark:border-border text-gray-900 dark:text-gray-200 focus:bg-gray-300 dark:focus:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800">
                      <SelectValue placeholder={plansLoading ? "Loading plans..." : "Choose a plan"} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{plan.name}</span>
                            <span className="text-sm text-gray-500">${plan.price}/month</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.requested_plan_id && (
                    <p className="text-sm text-red-500">{errors.requested_plan_id.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full text-lg bg-black dark:bg-primary hover:bg-gray-900 dark:hover:bg-gray-700 text-white dark:text-gray-100 focus:bg-black dark:focus:bg-gray-800 focus:ring-1 focus:ring-gray-600 dark:focus:ring-gray-600"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Request Access'}
                </Button>
                
                <div className="flex justify-center items-center text-sm mt-4 gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Already have an organization?{' '}
                    <Link href="/organization-login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Sign In
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