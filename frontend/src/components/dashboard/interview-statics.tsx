'use client';
import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import { api } from '@/lib/api';
import StatusWrapper from '../common/status-wrapper';
import { dashboardEndpoint } from '@/lib/endpoint';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface InterviewData {
  pass: number[];
  failed: number[];
  labels: string[];
  groupBy: 'day' | 'month';
}

interface EChartsFormatterParam {
  componentType: 'series';
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: number;
  value: number;
  color: string;
  axisValue: string;
  axisValueLabel: string;
}

type FilterType = 'today' | 'last7days' | 'month' | 'year' | 'custom';

const InterviewStatics: React.FC = () => {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('month');
  const [lastNonCustomFilter, setLastNonCustomFilter] = useState<FilterType>('month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const buildUrl = () => {
    // If custom is selected but no dates, use last non-custom filter
    const activeFilter =
      selectedFilter === 'custom' && (!dateRange?.from || !dateRange?.to)
        ? lastNonCustomFilter
        : selectedFilter;

    let url = `${dashboardEndpoint.INTERVIEW_DATA}?filter=${activeFilter}`;
    if (selectedFilter === 'custom' && dateRange?.from && dateRange?.to) {
      url += `&customStart=${format(dateRange.from, 'yyyy-MM-dd')}&customEnd=${format(dateRange.to, 'yyyy-MM-dd')}`;
    }
    return url;
  };

  const { data, isLoading, error, mutate, isValidating } = useSWR(buildUrl(), api.get);

  const [interviewData, setInterviewData] = React.useState<InterviewData>({
    pass: [],
    failed: [],
    labels: [],
    groupBy: 'month',
  });

  React.useEffect(() => {
    if (data?.data) {
      setInterviewData({
        pass: data.data.pass || [],
        failed: data.data.failed || [],
        labels: data.data.labels || [],
        groupBy: data.data.groupBy || 'month',
      });
    }
  }, [data]);

  const handleFilterChange = (filter: FilterType) => {
    // Save last non-custom filter
    if (filter !== 'custom') {
      setLastNonCustomFilter(filter);
    }

    setSelectedFilter(filter);
    setShowCustomPicker(filter === 'custom');
    if (filter !== 'custom') {
      setDateRange(undefined);
      setIsCalendarOpen(false);
    } else {
      // Auto-open calendar when custom is selected
      setTimeout(() => setIsCalendarOpen(true), 100);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    // Auto-apply and close calendar when both dates are selected
    if (range?.from && range?.to) {
      setIsCalendarOpen(false);
      setTimeout(() => mutate(), 100);
    }
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    setIsCalendarOpen(false);
    setShowCustomPicker(false);
    setSelectedFilter(lastNonCustomFilter);
  };

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'This Month', value: 'month' },
    { label: 'Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
  ];

  const options = {
    title: {
      text: 'Exam Results Statistics',
      left: '20px',
      top: '20px',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'light' ? '#333' : '#fff',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 30, 0.95)',
      borderColor: theme === 'light' ? '#e0e0e0' : '#444',
      borderWidth: 1,
      textStyle: {
        color: theme === 'light' ? '#333' : '#fff',
      },
      formatter: (params: EChartsFormatterParam[]) => {
        const date = params[0].axisValue;
        const passed = params[0].value;
        const failed = params[1].value;
        const total = passed + failed;
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${date}</div>
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%; margin-right: 8px;"></span>
              <span>Passed: <strong>${passed}</strong></span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></span>
              <span>Failed: <strong>${failed}</strong></span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${theme === 'light' ? '#e0e0e0' : '#444'};">
              <span>Total: <strong>${total}</strong></span>
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['Passed', 'Failed'],
      top: '60px',
      right: '20px',
      textStyle: {
        fontSize: 13,
        color: theme === 'light' ? '#666' : '#ccc',
      },
      itemWidth: 20,
      itemHeight: 14,
    },
    grid: {
      top: '110px',
      bottom: '60px',
      left: '60px',
      right: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: interviewData.labels || [],
      axisLine: {
        lineStyle: {
          color: theme === 'light' ? '#d1d5db' : '#4b5563',
        },
      },
      axisLabel: {
        fontSize: 11,
        color: theme === 'light' ? '#6b7280' : '#9ca3af',
        rotate: interviewData.labels.length > 12 ? 45 : 0,
        interval: 0,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Count',
      nameTextStyle: {
        color: theme === 'light' ? '#6b7280' : '#9ca3af',
        fontSize: 12,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        fontSize: 11,
        color: theme === 'light' ? '#6b7280' : '#9ca3af',
      },
      splitLine: {
        lineStyle: {
          color: theme === 'light' ? '#f3f4f6' : '#374151',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Passed',
        type: 'bar',
        stack: 'total',
        data: interviewData.pass || [],
        itemStyle: {
          color: theme === 'light' ? '#10b981' : '#34d399',
          borderRadius: [0, 0, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: theme === 'light' ? '#059669' : '#10b981',
          },
        },
        barMaxWidth: 50,
      },
      {
        name: 'Failed',
        type: 'bar',
        stack: 'total',
        data: interviewData.failed || [],
        itemStyle: {
          color: theme === 'light' ? '#ef4444' : '#f87171',
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: theme === 'light' ? '#dc2626' : '#ef4444',
          },
        },
        barMaxWidth: 50,
      },
    ],
  };

  return (
    <div className="max-w-full h-full m-auto mb-4">
      <StatusWrapper
        loading={isLoading || isValidating}
        error={error}
        reset={mutate}
        className="w-full h-full"
      >
        <div className="bg-white dark:bg-primary rounded-lg p-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => handleFilterChange(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === btn.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
            {showCustomPicker && (
              <div className="bg-gray-50 dark:bg-secondary/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap items-center gap-3">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-all ${
                          dateRange?.from
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-primary text-gray-500 dark:text-gray-400'
                        } hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {dateRange?.from && dateRange?.to ? (
                          <>
                            {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                            {format(dateRange.to, 'MMM dd, yyyy')}
                          </>
                        ) : dateRange?.from ? (
                          format(dateRange.from, 'MMM dd, yyyy')
                        ) : (
                          <span>Select dates</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={2}
                        defaultMonth={dateRange?.from}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  {dateRange?.from && (
                    <button
                      onClick={clearDateRange}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Picker */}

          {/* Chart */}
          <ReactECharts
            option={options}
            style={{ height: '450px', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </StatusWrapper>
    </div>
  );
};

export default InterviewStatics;
