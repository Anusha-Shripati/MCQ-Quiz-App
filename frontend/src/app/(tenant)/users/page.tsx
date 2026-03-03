import { Card} from '@/components/ui/card';
import Header from '@/components/user/header';
import UserTable from '@/components/user/user-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users',
};

const User: React.FC = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
          <UserTable />
      </Card>
    </div>
  );
};

export default User;
