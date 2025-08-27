'use client';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import { api } from '@/lib/api';
import StatusWrapper from '../common/status-wrapper';
import { dashboardEndpoint } from '@/lib/endpoint';

interface InterviewData {
  pass: number[];
  failed: number[];
  months: string[];
}
const InterviewStatics: React.FC = () => {
  const { theme } = useTheme();
  
  const { data, isLoading, error,mutate,isValidating } = useSWR(dashboardEndpoint.INTERVIEW_DATA, api.get);
  const [interviewData, setInterviewData] = React.useState<InterviewData>({
    pass: [],
    failed: [],
    months: [],
  });

  React.useEffect(() => {
    if (data) {
      setInterviewData((prv: InterviewData) => {
        const newData = { ...prv };
        newData.pass = data.data.pass;
        newData.failed = data.data.failed;
        newData.months = data.data.months;
        return newData;
      });
    }
  }, [data]);

  const options = {
    title: {
      text: 'Exam Results Statistics',
      left: '45px',
      top: '20px',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'light' ? '#333' : '#fff',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
      },
    },
    legend: {
      data: ['Passed', 'Failed'],
      // bottom: '5%',
      top: '95%',
      textStyle: {
        fontSize: 14,
        color: theme === 'light' ? '#666' : '#fff',
      },
    },
    grid: {
      top: '15%',
      bottom: '15%',
      left: '10%',
      right: '10%',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: interviewData.months || [],
      axisLine: {
        lineStyle: {
          color: theme === 'light' ? '#888' : '#fff',
        },
      },
      axisLabel: {
        fontSize: 12,
        color: theme === 'light' ? '#555' : '#fff',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        fontSize: 12,
        color: theme === 'light' ? '#555' : '#fff',
      },
      splitLine: {
        lineStyle: {
          color: theme === 'light' ? '#eee' : '#333',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Passed',
        type: 'line',
        data: interviewData.pass || [],
        smooth: true,
        lineStyle: {
          color: theme === 'light' ? '#adebbc' : '#00e676', // Bright green for "Passed"
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: theme === 'light' ? 'rgba(40, 167, 69, 0.5)' : 'rgba(0, 230, 118, 0.5)',
              }, // Green gradient
              {
                offset: 1,
                color: theme === 'light' ? 'rgba(40, 167, 69, 0)' : 'rgba(0, 230, 118, 0)',
              },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: theme === 'light' ? '#adebbc' : '#00e676',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: 'Failed',
        type: 'line',
        data: interviewData.failed || [],
        smooth: true,
        lineStyle: {
          color: theme === 'light' ? '#f0a8af' : '#ff5252', // Bright red for "Failed"
          width: 3,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: theme === 'light' ? 'rgba(220, 53, 69, 0.5)' : 'rgba(255, 82, 82, 0.5)',
              }, // Red gradient
              {
                offset: 1,
                color: theme === 'light' ? 'rgba(220, 53, 69, 0)' : 'rgba(255, 82, 82, 0)',
              },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: theme === 'light' ? '#f0a8af' : '#ff5252',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  };

  return (
    <div className='max-w-full h-full m-auto mb-4'>
      <StatusWrapper loading={isLoading || isValidating } error={error} reset={mutate} className='w-full h-full'>
        <ReactECharts
          option={options}
          style={{ height: '520px', width: '100%' }} // prev height 450px
          notMerge={true}
          lazyUpdate={true}
        />
      </StatusWrapper>
    </div>
  );
};

export default InterviewStatics;
