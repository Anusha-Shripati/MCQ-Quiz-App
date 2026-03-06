'use client';

import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import React from 'react';
interface Alert {
  id: string;
  issue_name: string;
  target_entity: string;
}
const systemAlert: Alert[] = [
  {
    id: '1',
    issue_name: 'New signup',
    target_entity: 'Tech solutions',
  },
  {
    id: '2',
    issue_name: 'Plan Upgraded',
    target_entity: 'Acme pvt ltd',
  },
  {
    id: '3',
    issue_name: 'Payment failed',
    target_entity: 'Team Plan',
  },
  {
    id: '4',
    issue_name: 'Plan Upgraded',
    target_entity: 'Business Plan',
  },
  {
    id: '5',
    issue_name: 'Plan Upgraded',
    target_entity: 'Enterprise Plan',
  },
];
const SystemAlertTable = () => {
  const columns: PlatformColumn<Alert>[] = [
    {
      key: 'name',
      header: 'Issue Name',
      render: (alert) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white"> {alert.issue_name}</div>
        </div>
      ),
    },
    {
      key: 'targetEntity',
      header: 'Target Entity',
      render: (alert) => (
        <div className="font-medium text-slate-900 dark:text-white">{alert.target_entity}</div>
      ),
    },
  ];
  return (
    <div>
      <PlatformTable
        columns={columns}
        data={systemAlert}
        rowKey="id"
        emptyMessage="No recent activity"
      />
    </div>
  );
};

export default SystemAlertTable;
