import { Card } from '@/components/ui/card';
import Header from '@/components/platform/usage/header';
import UsageTable from '@/components/platform/usage/usage-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Usage',
};

const PlatformUsagePage: React.FC = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <UsageTable />
      </Card>
    </div>
  );
};

export default PlatformUsagePage;
