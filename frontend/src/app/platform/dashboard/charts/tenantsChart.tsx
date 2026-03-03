'use client';

import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function TenantChart() {
  const series = [
    {
      name: 'Tenants',
      data: [120, 180, 240, 300, 360, 420],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#0066FF'],
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      opacity: 0.8,
    },
    // fill: {
    //   type: 'gradient',
    //   gradient: {
    //     shadeIntensity: 1,
    //     opacityFrom: 0.4,
    //     opacityTo: 0.05,
    //     stops: [0, 90, 100],
    //   },
    // },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: {
        style: { colors: '#64748B' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748B' },
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="w-full h-68">
      <Chart options={options} series={series} type="bar" height={290} />
    </div>
  );
}
