'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/form/input';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { platformPlanEndpoint } from '@/lib/endpoint';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const healthOptions = [
  { value: 'all', label: 'All Health' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'near_limit', label: 'Near Limit' },
  { value: 'critical', label: 'Critical' },
  { value: 'unlimited', label: 'Unlimited' },
];

const resourceOptions = [
  { value: 'all', label: 'All Resources' },
  { value: 'candidates', label: 'Candidates' },
  { value: 'assessments', label: 'Assessments' },
  { value: 'questions', label: 'Questions' },
];

export default function UsageHeader() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const { data: plansData } = useSWR(platformPlanEndpoint.LIST, fetcher);
  const planOptions =
    plansData?.data?.list?.map((plan: { name: string }) => plan.name).sort((a: string, b: string) =>
      a.localeCompare(b)
    ) || [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get('search') || '');
    setStatusFilter(params.get('status') || 'all');
    setHealthFilter(params.get('health') || 'all');
    setResourceFilter(params.get('resource') || 'all');
    setPlanFilter(params.get('plan') || 'all');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (healthFilter !== 'all') params.set('health', healthFilter);
      if (resourceFilter !== 'all') params.set('resource', resourceFilter);
      if (planFilter !== 'all') params.set('plan', planFilter);
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, healthFilter, resourceFilter, planFilter, pathname]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search tenants by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="pl-10 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              {planOptions.map((plan) => (
                <SelectItem key={plan} value={plan}>
                  {plan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="All Health" />
            </SelectTrigger>
            <SelectContent>
              {healthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-44 h-9 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              {resourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
    </div>
  );
}
