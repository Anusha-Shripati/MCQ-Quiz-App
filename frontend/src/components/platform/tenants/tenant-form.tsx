'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { api } from '@/lib/api';
import { platformTenantEndpoint } from '@/lib/endpoint';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { platformPlanEndpoint } from '@/lib/endpoint';
import { FormField } from '@/components/common/form-field';

const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  admin_email: z.string().email('Invalid email address'),
  admin_name: z.string().min(2, 'Admin name must be at least 2 characters'),
  admin_password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  plan_id: z.string().min(1, 'Plan is required'),
  provision: z.boolean(),
  status: z.enum(['active', 'trial', 'suspended', 'expired', 'cancelled']).optional(),
  trial_days: z.number().min(1, 'Trial days must be at least 1').max(365, 'Trial days cannot exceed 365').optional(),
  subscription_ends_at: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface Tenant {
  id: string;
  name: string;
  slug: string;
  admin_email: string;
  admin_name: string;
  plan: { id: string; name: string };
  status: 'active' | 'trial' | 'suspended' | 'expired' | 'cancelled';
  subscription_starts_at?: string;
  subscription_ends_at?: string;
}

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
}

interface PlanValidation {
  allowed: boolean;
  issues: string[];
  currentUsage: Record<string, number>;
  newLimits: Record<string, number>;
}

export default function TenantForm({ isOpen, onClose, tenant }: TenantFormProps) {
  const [isProvisioning, setIsProvisioning] = useState(!tenant);
  const [planValidation, setPlanValidation] = useState<PlanValidation | null>(null);
  const [isValidatingPlan, setIsValidatingPlan] = useState(false);
  const { data: plansData } = useSWR(platformPlanEndpoint.LIST, fetcher);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant ? {
      name: tenant.name,
      slug: tenant.slug,
      admin_email: tenant.admin_email,
      admin_name: tenant.admin_name,
      plan_id: tenant.plan.id,
      provision: false,
      status: tenant.status,
      subscription_ends_at: tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at).toISOString().split('T')[0] : '',
    } : {
      name: '',
      slug: '',
      admin_email: '',
      admin_name: '',
      admin_password: '',
      plan_id: '',
      provision: true,
      status: 'trial',
      trial_days: 30,
      subscription_ends_at: '',
    },
  });

  const name = watch('name');
  const provision = watch('provision');
  const planId = watch('plan_id');

  useEffect(() => {
    if (planId && plansData?.data?.list) {
      const plan = plansData.data.list.find((p: any) => p.id === planId);
      setSelectedPlan(plan);
    }
  }, [planId, plansData]);

  useEffect(() => {
    if (!tenant && name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [name, tenant, setValue]);

  // Validate plan change when plan changes in edit mode
  useEffect(() => {
    if (tenant && planId && planId !== tenant.plan.id) {
      validatePlanChange(planId);
    } else {
      setPlanValidation(null);
    }
  }, [planId, tenant]);

  const validatePlanChange = async (newPlanId: string) => {
    if (!tenant) return;
    
    setIsValidatingPlan(true);
    try {
      const response = await api.post(`${platformTenantEndpoint.VALIDATE_PLAN_CHANGE}/${tenant.id}/validate-plan-change`, {
        new_plan_id: newPlanId
      });
      
      if (response.success) {
        setPlanValidation(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to validate plan change');
      console.error('Plan validation error:', error);
    } finally {
      setIsValidatingPlan(false);
    }
  };

  const onSubmit = async (data: TenantFormData) => {
    try {
      if (tenant) {
        const originalPlanId = tenant.plan.id;
        const originalEndDate = tenant.subscription_ends_at;
        const newPlanId = data.plan_id;
        const newEndDate = data.subscription_ends_at;
        
        const planChanged = newPlanId !== originalPlanId;
        const endDateChanged = newEndDate !== (originalEndDate ? new Date(originalEndDate).toISOString().split('T')[0] : '');

        // Update basic info first
        const payload: any = {
          name: data.name,
          slug: data.slug,
          admin_email: data.admin_email,
          admin_name: data.admin_name,
        };

        // Only include plan_id if not changed (to avoid dual updates)
        if (!planChanged) {
          payload.plan_id = data.plan_id;
        }

        const res = await api.put(`${platformTenantEndpoint.UPDATE}/${tenant.id}`, payload);
        
        // Update status if changed
        if (data.status && data.status !== tenant.status) {
          await api.put(`${platformTenantEndpoint.STATUS}/${tenant.id}/status`, { status: data.status });
        }

        // Handle plan change with validation
        if (planChanged) {
          if (planValidation && !planValidation.allowed) {
            toast.error(`Cannot change plan: ${planValidation.issues.join(', ')}`);
            return;
          }
          
          await api.post(`${platformTenantEndpoint.APPLY_PLAN_CHANGE}/${tenant.id}/apply-plan-change`, {
            new_plan_id: newPlanId
          });
          toast.success('Plan changed successfully');
        }

        // Handle subscription end date change
        if (endDateChanged && newEndDate) {
          await api.put(`${platformTenantEndpoint.SUBSCRIPTION}/${tenant.id}/subscription`, {
            subscription_ends_at: new Date(newEndDate).toISOString()
          });
          toast.success('Subscription end date updated successfully');
        }

        if (res.success) {
          toast.success('Tenant updated successfully');
          mutate((key) => typeof key === 'string' && key.startsWith(platformTenantEndpoint.LIST));
          onClose();
        }
      } else {
        if (data.provision) {
          const payload: any = {
            name: data.name,
            slug: data.slug,
            admin_email: data.admin_email,
            admin_name: data.admin_name,
            admin_password: data.admin_password,
            plan_id: data.plan_id,
          };
          
          if (selectedPlan?.name?.toLowerCase() === 'free' && data.trial_days) {
            payload.trial_days = data.trial_days;
          }
          
          const res = await api.post(platformTenantEndpoint.PROVISION, payload);
          if (res.success) {
            toast.success('Tenant provisioned successfully');
            mutate((key) => typeof key === 'string' && key.startsWith(platformTenantEndpoint.LIST));
            onClose();
          }
        } else {
          const res = await api.post(platformTenantEndpoint.CREATE, {
            name: data.name,
            slug: data.slug,
            admin_email: data.admin_email,
            admin_name: data.admin_name,
            plan_id: data.plan_id,
            db_name: `${data.slug}_db`,
            db_url: `postgresql://postgres:root@localhost:5432/${data.slug}_db`,
            status: 'trial',
          });
          if (res.success) {
            toast.success('Tenant created successfully');
            mutate((key) => typeof key === 'string' && key.startsWith(platformTenantEndpoint.LIST));
            onClose();
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${tenant ? 'update' : 'create'} tenant`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {tenant ? 'Edit Tenant' : 'Create New Tenant'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {!tenant && (
            <div className="flex items-center space-x-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <input
                type="checkbox"
                id="provision"
                checked={provision}
                onChange={(e) => setIsProvisioning(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="provision" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Auto-provision (Create database + seed data)
              </label>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tenant Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                className="mt-1 h-11"
                placeholder="e.g., Acme Corporation"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Slug (Subdomain) *
              </label>
              <Input
                id="slug"
                {...register('slug')}
                className="mt-1 h-11"
                placeholder="e.g., acme"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Will be used as: {watch('slug') || 'slug'}.lr-mcq.com</p>
            </div>

            <div>
              <FormField
                label="Plan *"
                type="select"
                value={watch('plan_id')}
                onChange={(value) => setValue('plan_id', value)}
                options={plansData?.data?.list?.filter((p: any) => p.is_active).map((plan: any) => ({
                  value: plan.id,
                  label: `${plan.name} - $${plan.price}/mo`
                })) || []}
                placeholder="Select a plan"
              />
              {errors.plan_id && (
                <p className="text-red-500 text-sm mt-1">{errors.plan_id.message}</p>
              )}
              
              {/* Plan validation feedback */}
              {tenant && planId !== tenant.plan.id && (
                <div className="mt-2">
                  {isValidatingPlan ? (
                    <p className="text-blue-600 text-sm">Validating plan change...</p>
                  ) : planValidation ? (
                    <div className={`p-3 rounded-lg text-sm ${
                      planValidation.allowed 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {planValidation.allowed ? (
                        <div>
                          <p className="font-medium">✓ Plan change allowed</p>
                          <p className="text-xs mt-1">Current usage is within new plan limits</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">⚠ Plan change blocked</p>
                          <ul className="text-xs mt-1 space-y-1">
                            {planValidation.issues.map((issue, index) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="admin_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Admin Name *
              </label>
              <Input
                id="admin_name"
                {...register('admin_name')}
                className="mt-1 h-11"
                placeholder="e.g., John Doe"
              />
              {errors.admin_name && (
                <p className="text-red-500 text-sm mt-1">{errors.admin_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="admin_email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Admin Email *
              </label>
              <Input
                id="admin_email"
                type="email"
                {...register('admin_email')}
                className="mt-1 h-11"
                placeholder="admin@acme.com"
              />
              {errors.admin_email && (
                <p className="text-red-500 text-sm mt-1">{errors.admin_email.message}</p>
              )}
            </div>

            {!tenant && provision && (
              <div>
                <label htmlFor="admin_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Admin Password *
                </label>
                <Input
                  id="admin_password"
                  type="password"
                  {...register('admin_password')}
                  className="mt-1 h-11"
                  placeholder="Min 8 characters"
                />
                {errors.admin_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.admin_password.message}</p>
                )}
              </div>
            )}

            {!tenant && provision && selectedPlan && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Subscription Details
                </h4>
                {selectedPlan.name.toLowerCase() === 'free' ? (
                  <div>
                    <label htmlFor="trial_days" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Trial Duration (Days) *
                    </label>
                    <Input
                      id="trial_days"
                      type="number"
                      {...register('trial_days', { valueAsNumber: true })}
                      className="mt-1 h-11"
                      placeholder="30"
                      min="1"
                      max="365"
                    />
                    {errors.trial_days && (
                      <p className="text-red-500 text-sm mt-1">{errors.trial_days.message}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Status: Trial (1-365 days, default: 30 days)</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Status: <span className="font-semibold text-emerald-600">Active</span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Duration: <span className="font-semibold">30 days</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {tenant && (
              <>
                <div>
                  <FormField
                    label="Status *"
                    type="select"
                    value={watch('status') || 'trial'}
                    onChange={(value) => setValue('status', value as any)}
                    options={[
                      { value: 'trial', label: 'Trial' },
                      { value: 'active', label: 'Active' },
                      { value: 'suspended', label: 'Suspended' },
                      { value: 'expired', label: 'Expired' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subscription_ends_at" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subscription Ends At
                  </label>
                  <Input
                    id="subscription_ends_at"
                    type="date"
                    {...register('subscription_ends_at')}
                    className="mt-1 h-11"
                  />
                  <p className="text-xs text-slate-500 mt-1">Note: Subscription start date cannot be modified after creation</p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
            >
              {isSubmitting ? (provision && !tenant ? 'Provisioning...' : 'Saving...') : tenant ? 'Update Tenant' : (provision ? 'Provision Tenant' : 'Create Tenant')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
