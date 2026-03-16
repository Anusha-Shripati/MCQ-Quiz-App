import { Card } from '@/components/ui/card';
import Header from '@/components/platform/tenant-requests/header';
import TenantRequestTable from '@/components/platform/tenant-requests/tenant-request-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Tenant Requests',
};

const PlatformTenantRequests: React.FC = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <TenantRequestTable />
      </Card>
    </div>
  );
};

export default PlatformTenantRequests;