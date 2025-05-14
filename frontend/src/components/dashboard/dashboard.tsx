import { Card } from '@/components/ui/card';
import Calendar from '@/components/dashboard/calendar-card';
import InterviewStatics from '@/components/dashboard/interview-statics';
import Questions from '@/components/dashboard/questions';
import InterviewCount from './interview-count';
import InterviewScore from './interview-score';
// import { ThemeToggle } from "../common/theme-toggle";
// import LogoutButton from "../common/logout-button";

export default function Dashboard() {
  return (
    <>
      <div className="min-h-screen p-6 bg-gradient-to-b grid grid-cols-12 gap-5">
        <Card className="shadow-lg col-span-12 md:col-span-8 ">
          <InterviewStatics />
        </Card>
        <Card className="shadow-lg col-span-12 md:col-span-4">
          <Calendar />
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
