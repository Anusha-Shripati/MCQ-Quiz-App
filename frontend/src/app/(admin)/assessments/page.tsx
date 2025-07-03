import AssessmentHeader from '@/components/assessments/assessment-header';
import AssessmentDetails from '@/components/assessments/assessment-details';
import { Card } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessments',
};

export default function AssessmentPage() {
  return (
     <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2 h-full">
        
        <AssessmentHeader />
        <div className="overflow-y-auto mt-2">
          <AssessmentDetails />
        </div>
      </Card>
    </div >
  );
}
