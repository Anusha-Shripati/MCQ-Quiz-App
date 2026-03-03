'use client';
import { PlatformCard } from '@/components/platform/ui/PlatformCard';
import SubscriptionPlan from '@/app/platform/dashboard/charts/subscriptionPlan';
import TenantChart from './charts/tenantsChart';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { platformPlanEndpoint } from '@/lib/endpoint';
import { platformTenantEndpoint } from '@/lib/endpoint';
import ActivityTable from './activityTable/activity-table';
import SystemAlertTable from './system-alerts/system-alerts';
import TenantUsageChart from './charts/tenantUsageChart';
// import RevenueChart from './charts/revenueChart';
export default function PlatformDashboard() {
  const { data: plansData } = useSWR(`${platformPlanEndpoint.LIST}`, fetcher);
  const totalPlans = plansData?.data?.count;
  const { data: tenantsData } = useSWR(`${platformTenantEndpoint.LIST}`, fetcher);
  const totalTenants = tenantsData?.data?.count;
  return (
    <div className="px-2 py-6 flex flex-col h-full">
      <PlatformCard className="flex flex-col p-4 sm:p-6 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome to the Platform Admin Portal
          </p>
        </div>
        <div className="mx-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-3 shadow border border-indigo-200 dark:border-indigo-800">
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {totalTenants}
              </p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Total Tenants</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-3 shadow border border-indigo-200 dark:border-indigo-800">
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">18</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Active Tenants</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-3 shadow border border-indigo-200 dark:border-indigo-800">
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {totalPlans}
              </p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Plans</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-3 shadow border border-indigo-200 dark:border-indigo-800">
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">$6000</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Total Revenue</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-3 shadow border border-indigo-200 dark:border-indigo-800">
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">40%</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Growth</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 px-4 py-3">
          <div className="w-full md:w-3/5 rounded-xl p-6 border border-slate-200 dark:border-slate-700 ">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Resource Usage by Tenants
            </h2>
            <TenantUsageChart />
          </div>
          <div className="w-full md:w-2/5 rounded-xl p-6 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 ">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Tenants</h2>
            <TenantChart />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 px-4 py-2">
          <div className="w-full md:w-3/5 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              System / Alerts
            </h2>
            <SystemAlertTable />
            {/* <p className="text-slate-600 dark:text-slate-400">Activity feed coming soon...</p> */}
          </div>
          <div className="w-full md:w-2/5 rounded-xl p-6 border border-slate-200 dark:border-slate-700 ">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Subscription Plans
            </h2>
            <SubscriptionPlan />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-3/5 rounded-xl p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Revenue generated Plans
            </h2>
            <ActivityTable />
            {/* <p className="text-slate-600 dark:text-slate-400">Activity feed coming soon...</p> */}
          </div>
          <div className="w-full md:w-2/5 rounded-xl p-6 border border-slate-200 dark:border-slate-700 ">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Revenue Chart
            </h2>
          </div>
        </div>
      </PlatformCard>
    </div>
  );
}
