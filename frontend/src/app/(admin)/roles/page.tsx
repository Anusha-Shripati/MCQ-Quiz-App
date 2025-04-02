import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Header from "@/components/roles/header";
import RoleTable from "@/components/roles/role-table";


const UserTable = () => {
  return (
    <div className="p-6 min-h-screen">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <Header/>
        </CardHeader>
        <CardContent>
          <RoleTable/>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTable;