import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Header from "@/components/user/header";
import UserTable from "@/components/user/user-table";


const User: React.FC = () => {
  return (
    <div className="p-6">
      <Card >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <Header />
        </CardHeader>
        <CardContent >
          <UserTable />
        </CardContent>
      </Card>

    </div>
  );
};

export default User;
