'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar } from '../../ui/calendar';
import { CalendarEvent, DateRange } from '@/types/common.types';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { IExam } from '@/types/exam.types';
import dayjs from 'dayjs';
import { Button } from '../../ui/form/button';
import { Tooltip, TooltipTrigger } from '../../ui/tooltip';
import { DayProps } from 'react-day-picker';
import EventTooltip from './event-tooltip';
import { dashboardEndpoint } from '@/lib/endpoint';

type CalendarDate = Date | undefined | DateRange;

export default function CalendarCard() {
  const [date, setDate] = useState<CalendarDate>(new Date());
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<CalendarEvent>({});

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('year', String(year));
    params.set('month', String(month));
    return `${dashboardEndpoint.CALENDAR_DATA}?` + params.toString();
  }, [month, year]);

  const { data } = useSWR(query, api.get);
  console.log('Calendar Data:', data);
  useEffect(() => {
    if (data && Array.isArray(data.data)) {
      const eventMap: CalendarEvent = {};
      data.data.forEach((item: IExam) => {
        const { start_time, is_completed, results } = item;
        const dateKey = dayjs(start_time).format('YYYY-MM-DD');
        const pass = results?.percentage >= 60;
        const color = is_completed ? (pass ? '#16a34a' : '#dc2626') : '#6b7280';
        const eventMeta = {
          percentage: results?.percentage?.toFixed(1),
          name: item.candidate?.name,
          experience: item.candidate?.experience,
          assessment: item.assessment?.name,
          title: is_completed ? (pass ? 'Passed' : 'Failed') : 'Pending',
          email: item.candidate?.email,
          resultId: item.results?.id,
        };
        if (eventMap[dateKey]) {
          eventMap[dateKey].push({ color, meta: eventMeta });
        } else {
          eventMap[dateKey] = [{ color, meta: eventMeta }];
        }
      });
      setEvents(eventMap);
    }
  }, [data]);

  const renderEvents = useCallback(
    (props: DayProps) => {
      const dateKey = dayjs(props.date).format('YYYY-MM-DD');
      const day = dayjs(props.date).date();
      const dateMonth = dayjs(props.date).month();
      const month = dayjs(props.displayMonth).month();
      const today = new Date().getDate();
      const todayMonth = new Date().getMonth();
      const isCurrentMonth = dateMonth === month;

      const dayClasses = [
        'h-full w-full justify-start flex flex-col items-center px-2 py-1 rounded transition',
        isCurrentMonth ? 'dark:bg-gray-700' : 'text-gray-400 dark:text-gray-500',
        day === today && dateMonth === todayMonth
          ? 'border-2 border-gray dark:border-blue-400'
          : 'border-2 border-transparent',
        'hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-600',
      ].join(' ');

      if (dateKey in events) {
        const totalEvents = events[dateKey].length;
        const displayEvents = events[dateKey].slice(0, 2);
        const remainingEvents = totalEvents > 2 ? totalEvents - 2 : 0;

        return (
          <div className="group w-full h-full">
            <Tooltip delayDuration={0}>
              <TooltipTrigger className={`${dayClasses}`}>
                <div className="font-bold m-0">{day}</div>
                <div className="flex flex-wrap gap-1">
                  {displayEvents.map((data, index) => (
                    <EventDot key={index} color={data.color} />
                  ))}
                  {remainingEvents > 0 && (
                    <div className="h-3 text-xs font-medium text-gray-500">+{remainingEvents}</div>
                  )}
                </div>
              </TooltipTrigger>
              <EventTooltip dateKey={dateKey} events={events} />
            </Tooltip>
          </div>
        );
      }
      return (
        <Button
          className={dayClasses}
          aria-label={`No events for ${dateKey}`}
          variant="ghost"
        >
          <div className="mt-2">{day}</div>
        </Button>
      );
    },
    [events]
  );

  const handleMonthYear = (date: Date) => {
    setMonth(new Date(date).getMonth());
    setYear(new Date(date).getFullYear());
  };

  return (
    <Calendar
      selected={date as DateRange}
      onSelect={(value: CalendarDate) => setDate(value as CalendarDate)}
      className="dashboard-calander rounded-md border h-full w-full"
      onMonthChange={handleMonthYear}
      events={events}
      renderEvents={renderEvents}
    />
  );
}

function EventDot({ color }: { color: string }) {
  return (
    <div
      className="h-3 w-3 rounded-full"
      style={{ background: color }}
    />
  );
}