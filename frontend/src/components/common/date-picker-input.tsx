'use client';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/form/input';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

interface DatePickerInputProps {
  label: string;
  date?: Date;
  setDate: (date?: Date) => void;
  error?: string | undefined;
}
const today = new Date();
export const DatePickerInput = ({ label, date, setDate, error }: DatePickerInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input value={date ? formatDate(date) : ''} readOnly className="cursor-pointer pl-10" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            disabled={(dateValue: Date) => {
              // Compare only the date parts to allow today's date
              const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const dateValueOnly = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
              return dateValueOnly < todayDateOnly;
            }}
            selected={date}
            onSelect={setDate}
            className="rounded-md border dark:bg-background bg-gray-50"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
