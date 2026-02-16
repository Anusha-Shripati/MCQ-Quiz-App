import { Card } from '@/components/ui/card';
import Header from '@/components/platform/roles/header';
import RoleTable from '@/components/platform/roles/role-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Roles',
};

const PlatformRoles = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <RoleTable />
      </Card>
    </div>
  );
};

export default PlatformRoles;
