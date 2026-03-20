'use client';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import useSWR from 'swr';
import { platformDashboardEndpoint } from '@/lib/endpoint';
import { fetcher } from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function TenantChart() {
  const { data } = useSWR(`${platformDashboardEndpoint.TENANT_GROWTH}`, fetcher);
  const chartInfo = data?.data || { categories: [], seriesData: [] };

  const series = [
    {
      name: 'New Tenants',
      data: chartInfo.seriesData,
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
    xaxis: {
      categories: chartInfo.categories,
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
      enabled: true,
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
