'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Textarea } from '@/components/ui/form/textarea';
import { api } from '@/lib/api';
import { platformPlanEndpoint } from '@/lib/endpoint';
import toast from 'react-hot-toast';
import { Plan } from '@/store/platformPlanStore';
import { mutate } from 'swr';

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  limits: z.object({
    candidates: z.number().int(),
    assessments: z.number().int(),
    questions: z.number().int(),
    storage_mb: z.number().int(),
    api_calls: z.number().int(),
  }),
  features: z.object({
    custom_branding: z.boolean(),
    api_access: z.boolean(),
    priority_support: z.boolean(),
    advanced_analytics: z.boolean(),
  }),
  is_active: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan;
}

export default function PlanForm({ isOpen, onClose, plan }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan || {
      name: '',
      description: '',
      price: 0,
      limits: {
        candidates: -1,
        assessments: -1,
        questions: -1,
        storage_mb: -1,
        api_calls: -1,
      },
      features: {
        custom_branding: false,
        api_access: false,
        priority_support: false,
        advanced_analytics: false,
      },
      is_active: true,
    },
  });

  const features = watch('features');

  const onSubmit = async (data: PlanFormData) => {
    try {
      const url = plan
        ? `${platformPlanEndpoint.UPDATE}/${plan.id}`
        : platformPlanEndpoint.CREATE;
      
      // Remove is_active from payload as it's handled by toggle endpoint
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        limits: data.limits,
        features: data.features,
      };
      
      const res = plan
        ? await api.put(url, payload)
        : await api.post(url, payload);

      if (res.success) {
        toast.success(`Plan ${plan ? 'updated' : 'created'} successfully`);
        mutate((key) => typeof key === 'string' && key.startsWith(platformPlanEndpoint.LIST));
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${plan ? 'update' : 'create'} plan`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Basic Information
            </h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Plan Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                className="mt-1 h-11"
                placeholder="e.g., Pro Plan"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                className="mt-1"
                placeholder="Brief description of the plan"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Price ($/month) *
              </label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="mt-1 h-11"
                placeholder="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Resource Limits
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use -1 for unlimited
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="candidates" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Candidates
                </label>
                <Input
                  id="candidates"
                  type="number"
                  {...register('limits.candidates', { valueAsNumber: true })}
                  className="mt-1 h-11"
                  placeholder="-1"
                />
              </div>

              <div>
                <label htmlFor="assessments" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Assessments
                </label>
                <Input
                  id="assessments"
                  type="number"
                  {...register('limits.assessments', { valueAsNumber: true })}
                  className="mt-1 h-11"
                  placeholder="-1"
                />
              </div>

              <div>
                <label htmlFor="questions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Questions
                </label>
                <Input
                  id="questions"
                  type="number"
                  {...register('limits.questions', { valueAsNumber: true })}
                  className="mt-1 h-11"
                  placeholder="-1"
                />
              </div>

              <div>
                <label htmlFor="storage_mb" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Storage (MB)
                </label>
                <Input
                  id="storage_mb"
                  type="number"
                  {...register('limits.storage_mb', { valueAsNumber: true })}
                  className="mt-1 h-11"
                  placeholder="-1"
                />
              </div>

              <div>
                <label htmlFor="api_calls" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  API Calls
                </label>
                <Input
                  id="api_calls"
                  type="number"
                  {...register('limits.api_calls', { valueAsNumber: true })}
                  className="mt-1 h-11"
                  placeholder="-1"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Features
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="custom_branding"
                  checked={features.custom_branding}
                  onChange={(e) => setValue('features.custom_branding', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="custom_branding" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Custom Branding
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="api_access"
                  checked={features.api_access}
                  onChange={(e) => setValue('features.api_access', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="api_access" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  API Access
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="priority_support"
                  checked={features.priority_support}
                  onChange={(e) => setValue('features.priority_support', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="priority_support" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Priority Support
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="advanced_analytics"
                  checked={features.advanced_analytics}
                  onChange={(e) => setValue('features.advanced_analytics', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="advanced_analytics" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Advanced Analytics
                </label>
              </div>
            </div>
          </div>

          {/* Status - Only show for create */}
          {!plan && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={watch('is_active')}
                onChange={(e) => setValue('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Active (visible to tenants)
              </label>
            </div>
          )}

          {/* Actions */}
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
              {isSubmitting ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
