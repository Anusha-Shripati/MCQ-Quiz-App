'use client';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface InterviewCountData {
  label: string;
  value: number;
  color: string;
}

function InterviewCount() {
  const { data } = useSWR('/dashboard/get-interview-count', api.get);

  const [interviewData, setInterviewData] = useState<InterviewCountData[]>([
    { label: 'Last Month', value: 0, color: 'blue' },
    { label: 'Today', value: 0, color: 'green' },
    { label: 'Upcoming', value: 0, color: 'yellow' },
  ]);

  useEffect(() => {
    if (data) {
      setInterviewData((prv: InterviewCountData[]) => {
        const newData = [...prv];
        newData[0].value = data.data.lastMonth;
        newData[1].value = data.data.today;
        newData[2].value = data.data.upcoming;
        return newData;
      });
    }
  }, [data]);

  return (
    <div className="col-span-12 md:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {interviewData.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-4 bg-card text-card-foreground shadow-md rounded-lg"
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              stat.color === 'blue'
                ? 'bg-blue-100'
                : stat.color === 'green'
                  ? 'bg-green-100'
                  : 'bg-yellow-100'
            }`}
          >
            <span
              className={`text-xl font-bold ${
                stat.color === 'blue'
                  ? 'text-blue-600'
                  : stat.color === 'green'
                    ? 'text-green-600'
                    : 'text-yellow-600'
              }`}
            >
              {stat.value}
            </span>
          </div>
          <span className="text-sm  mt-2">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export default InterviewCount;
