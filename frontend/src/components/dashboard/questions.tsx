'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import { api } from '@/lib/api';
import StatusWrapper from '../common/status-wrapper';
import { dashboardEndpoint } from '@/lib/endpoint';

interface GraphData {
  _count: number;
  technology_id: string;
  name: string;
}

export default function Questions() {
  const { theme } = useTheme();
  const { data: questionsData, isLoading, error, isValidating, mutate } = useSWR(dashboardEndpoint.QUESTIONS_DATA, api.get);
  const [options, setOptions] = useState({})
  
  const totalCount = useMemo(
    () => questionsData?.data?.reduce((sum: number, item: GraphData) => sum + item._count, 0) || 0,
    [questionsData]
  );
  const graphData = useMemo(() => {
    return (
      questionsData?.data?.map((item: GraphData) => ({
        value: item._count,
        name: item.name,
      })) || []
    );
  }, [questionsData]);

  useEffect(() => {

    setOptions({
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: 'center',
        left: 'left',
        orient: 'vertical',
        textStyle: {
          fontSize: 16,
          color: theme === 'light' ? '#333' : '#fff',
        },
      },

      series: [
        {
          name: 'Questions count',
          type: 'pie',
          radius: ['50%', '80%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: theme === 'light' ? '#333' : '#fff',
            formatter: `{total|${totalCount}}\n{small|Total Questions}`,
            rich: {
              total: { fontSize: 24, fontWeight: 'bold', color:theme === 'light' ?  '#333':'#fff' },
              small: { fontSize: 14, color:theme === 'light' ? '#666': '#fff' },
            },
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: true,
          },
          data: graphData,
        },
      ],
    });
  }, [theme, graphData]);

  return (
    <>
      <div className="p-4 rounded-md h-full min-h-[500px]">
        <h2 className="font-semibold mb-4 top-0 z-5">Questions Data</h2>
        <StatusWrapper loading={isLoading || isValidating} error={error} reset={mutate} className='h-full'>
          {graphData.length > 0 && (
            <ReactECharts
              option={options}
              style={{ height: '450px', width: '100%' }}
              notMerge={true}
              lazyUpdate={true}
            />)
          }
          {graphData.length == 0 && (
            <div className="w-full h-[400px] flex items-center justify-center">
              There is no data available
            </div>
          )}
        </StatusWrapper>
      </div>
    </>
  );
}
