import { Card,  CardContent } from '@/components/ui/card';
import Header from '@/components/roles/header';
import RoleTable from '@/components/roles/role-table';

const UserTable = () => {
  return (
    <div className="p-6 ">
        <div className="mb-6">
          <Header />
        </div>
      <Card>
        <CardContent>
          <RoleTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTable;
