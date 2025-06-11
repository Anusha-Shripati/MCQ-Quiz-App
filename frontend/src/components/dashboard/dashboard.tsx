import { Card } from '@/components/ui/card';
import CalendarCard from './calendar/calendar-card';
import InterviewStatics from '@/components/dashboard/interview-statics';
import Questions from '@/components/dashboard/questions';
import InterviewCount from './interview-count';
import InterviewScore from './interviewScore/interview-score';

export default function Dashboard() {
  return (
    <>
      <div className="min-h-screen px-2 py-6 bg-gradient-to-b grid grid-cols-12 gap-5">
        <Card className="shadow-lg col-span-12 md:col-span-8 ">
          <InterviewStatics />
        </Card>
        <Card className="shadow-lg col-span-12 md:col-span-4">
          <CalendarCard />
        </Card>
        <InterviewCount />
        <InterviewScore />
        <Card className="shadow-lg md:col-span-6">
          <Questions />
        </Card>
      </div>
    </>
  );
}
