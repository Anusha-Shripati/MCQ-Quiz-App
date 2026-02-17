import { Card } from '@/components/ui/card';
import Header from '@/components/platform/plans/header';
import PlanTable from '@/components/platform/plans/plan-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Plans',
};

const PlatformPlans: React.FC = () => {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        <Header />
        <PlanTable />
      </Card>
    </div>
  );
};

export default PlatformPlans;
