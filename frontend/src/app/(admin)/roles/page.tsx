import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/roles/header';
import RoleTable from '@/components/roles/role-table';
import MainHeader from '@/components/roles/main-header';

const UserTable = () => {
  return (
    <div className="p-6 ">
      <div className="mb-6">
        <MainHeader />
      </div>
      <Card className="flex flex-col p-4 sm:p-6 gap-2">
        <Header />
        <CardContent>
          <RoleTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTable;
