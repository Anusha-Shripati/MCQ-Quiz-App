'use client';

import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function SubscriptionPlanPieChart() {
  const series = [50, 20, 15, 5];

  const options: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: ['Free', 'Pro', 'Team / Business', 'Enterprise'],
    colors: ['#0066FF', '#03045e', '#66A3FF', '#00b4d8'],
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
