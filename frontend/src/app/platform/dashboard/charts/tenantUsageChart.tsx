'use client';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import useSWR from 'swr';
import { platformDashboardEndpoint } from '@/lib/endpoint';
import { fetcher } from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function TenantUsageChart() {
  const { data } = useSWR(`${platformDashboardEndpoint.PLATFORM_USAGE}`, fetcher);
  const usageData = data?.data || [];
  const candidatesData = usageData.map((item: any) => item.candidates);
  const assessmentsData = usageData.map((item: any) => item.assessments);
  const questionsData = usageData.map((item: any) => item.questions);
  const series = [
    {
      name: 'Total Candidates',
      data: candidatesData,
      // data: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
      color: '#0066FF',
    },
    {
      name: 'Total Assessments',
      data: assessmentsData,
      // data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
      color: '#f18805',
    },
    {
      name: 'Total Questions',
      data: questionsData,
      // data: [8200, 6100, 5600, 9200, 11800, 10400, 12600],
      color: '#66A3FF',
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 4,
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -26,
      },
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748B',
        useSeriesColors: false,
      },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      labels: {
        style: { colors: '#64748B' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748B' },
      },
    },
  };
  return (
    <div className="w-full h-68">
      <Chart options={options} series={series} type="line" height={290} margin={2} />
    </div>
  );
}
