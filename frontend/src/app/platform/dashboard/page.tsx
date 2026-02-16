import { PlatformCard } from '@/components/platform/ui/PlatformCard';

export default function PlatformDashboard() {
  return (
    <div className="px-2 py-6 flex flex-col h-full">
      <PlatformCard className="flex flex-col p-4 sm:p-6 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome to the Platform Admin Portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-6 shadow border border-indigo-200 dark:border-indigo-800">
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">24</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Total Tenants</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-6 shadow border border-indigo-200 dark:border-indigo-800">
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">18</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Active Tenants</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-6 shadow border border-indigo-200 dark:border-indigo-800">
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">5</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Plans</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-xl p-6 shadow border border-indigo-200 dark:border-indigo-800">
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">12</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Platform Admins</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Recent Activity</h2>
          <p className="text-slate-600 dark:text-slate-400">Activity feed coming soon...</p>
        </div>
      </PlatformCard>
    </div>
  );
}
