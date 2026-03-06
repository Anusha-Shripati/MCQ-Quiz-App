'use client';

import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en');
interface Activity {
  id: string;
  plan_name: string;
  tenants_buy: number;
  revenue: number;
  profit: number;
}
const activities: Activity[] = [
  {
    id: '1',
    plan_name: 'Free Plan',
    tenants_buy: 150,
    revenue: 200,
    profit: 100,
  },
  {
    id: '2',
    plan_name: 'Pro Plan',
    tenants_buy: 80,
    revenue: 300,
    profit: 50,
  },
  {
    id: '3',
    plan_name: 'Team / Business Plan',
    tenants_buy: 100,
    revenue: 400,
    profit: 80,
  },
  {
    id: '4',
    plan_name: 'Enterprise Plan',
    tenants_buy: 30,
    revenue: 500,
    profit: 20,
  },
];

const ActivityTable = () => {
  const columns: PlatformColumn<Activity>[] = [
    {
      key: 'name',
      header: 'Plans',
      render: (activity) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white"> {activity.plan_name}</div>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Tenant',
      render: (activity) => (
        <div className="font-medium text-slate-900 dark:text-white">{activity.tenants_buy}</div>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (activity) => (
        <div className="font-medium text-slate-900 dark:text-white">{activity.revenue}</div>
      ),
    },
    {
      key: 'profit',
      header: 'Profit',
      render: (activity) => (
        <div className="font-medium text-slate-500 dark:text-slate-400">{activity.profit}</div>
      ),
    },
  ];
  return (
    <div>
      <PlatformTable
        columns={columns}
        data={activities}
        rowKey="id"
        emptyMessage="No recent activity"
      />
    </div>
  );
};

export default ActivityTable;
