import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Calendar from "@/components/dashboard/calendar-card";
import InterviewStatics from "@/components/dashboard/interview-statics";
import { data, languages, monthData, scores } from "@/shared/constants/data";
import LanguageScoreSelect from "@/components/dashboard/filter";
import Questions from "@/components/dashboard/questions";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const lastMonth = 89;
  const upcoming = 12;
  const today = 5;
  const interviews = data;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b grid grid-cols-12 gap-5">
      {/* Top Section */}
      <Card className="shadow-lg col-span-12 md:col-span-8 ">
        <InterviewStatics monthdata={monthData} />
      </Card>
      <Card className="shadow-lg col-span-12 md:col-span-4">
        <Calendar />
      </Card>

      {/* Statistics Section */}
      <div className="col-span-12 md:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Last Month", value: lastMonth, color: "blue" },
          { label: "Today", value: today, color: "green" },
          { label: "Upcoming", value: upcoming, color: "yellow" },
        ].map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-card text-card-foreground shadow-md rounded-lg"
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                stat.color === "blue"
                  ? "bg-blue-100"
                  : stat.color === "green"
                  ? "bg-green-100"
                  : "bg-yellow-100"
              }`}
            >
              <span
                className={`text-xl font-bold ${
                  stat.color === "blue"
                    ? "text-blue-600"
                    : stat.color === "green"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {stat.value}
              </span>
            </div>
            <span className="text-sm  mt-2">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Interview Scores */}
      <Card className="col-span-12 md:col-span-6 row-span-2">
        <CardHeader>
          <div className="flex items-center justify-between space-x-3">
            <div className="space-y-1">
              <CardTitle>
                Interview Scores
              </CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Performance of candidates.
              </CardDescription>
            </div>

            <LanguageScoreSelect languages={languages} scores={scores} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 hover:text-gray-700 transition"
                  >
                    <td className="px-4 py-2">{interview.date}</td>
                    <td className="px-4 py-2 flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <span>{interview.name}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={parseInt(interview.score)}
                          className="w-32 "
                        />
                        <span>{interview.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className="shadow-lg md:col-span-6">
        <Questions />
      </Card>
    </div>
  );
}
