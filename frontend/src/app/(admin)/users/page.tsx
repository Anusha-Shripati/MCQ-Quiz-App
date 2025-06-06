import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/user/header';
import UserTable from '@/components/user/user-table';
import UserMainHeader from '@/components/user/user-main-header';

const User: React.FC = () => {
  return (
    <div className="p-6">
      <div className='mb-6'>
        <UserMainHeader />
      </div>
      <Card className="flex flex-col p-4 sm:p-6 gap-2">
        <Header />
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default User;
