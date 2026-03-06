'use client';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import useSWR from 'swr';
import { platformDashboardEndpoint } from '@/lib/endpoint';
import { fetcher } from '@/lib/api';

type PlanData = {
  name: string;
  tenantCount: number;
};

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function SubscriptionPlanPieChart() {
  const { data } = useSWR(`${platformDashboardEndpoint.PLAN_DISTRIBUTION}`, fetcher);
  const chartData: PlanData[] = data?.data || [];
  const series = chartData.map((item) => item.tenantCount);
  const label = chartData.map((item) => item.name);
  const options: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: label,
    colors: ['#0066FF', '#f18805', '#ff3c38', '#058c42'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748B',
        useSeriesColors: false,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        colors: ['#ffffff'],
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -5,
        },
      },
    },
  };
  return (
    <div className="w-full h-68">
      <Chart options={options} series={series} type="pie" height={290} margin={2} />
    </div>
  );
}
