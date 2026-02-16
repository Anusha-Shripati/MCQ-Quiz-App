import { Card} from '@/components/ui/card';
import Header from '@/components/platform/admins/header';
import AdminTable from '@/components/platform/admins/admin-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Admins',
};

const PlatformAdmins: React.FC = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <AdminTable />
      </Card>
    </div>
  );
};

export default PlatformAdmins;
