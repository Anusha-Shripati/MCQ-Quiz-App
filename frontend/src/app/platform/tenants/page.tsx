import { Card } from '@/components/ui/card';
import Header from '@/components/platform/tenants/header';
import TenantTable from '@/components/platform/tenants/tenant-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Tenants',
};

const PlatformTenants: React.FC = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <TenantTable />
      </Card>
    </div>
  );
};

export default PlatformTenants;
