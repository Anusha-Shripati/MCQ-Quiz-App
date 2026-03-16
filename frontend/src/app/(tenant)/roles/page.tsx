import { Card } from '@/components/ui/card';
import Header from '@/components/roles/header';
import RoleTable from '@/components/roles/role-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roles',
};


const UserTable = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <RoleTable />
      </Card>
    </div>
  );
};

export default UserTable;
