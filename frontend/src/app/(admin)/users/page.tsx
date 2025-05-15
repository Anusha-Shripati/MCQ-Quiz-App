import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/user/header';
import UserTable from '@/components/user/user-table';

const User: React.FC = () => {
  return (
    <div className="p-6">
      <div className='mb-6'>
        <Header />
      </div>
      <Card>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default User;
