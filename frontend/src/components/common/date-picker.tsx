import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { Input } from '@/components/ui/input';  // Assuming you have the Input component from shadcn
import { format } from 'date-fns'; // For formatting date
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';

// Define the DatePicker component
const DatePicker: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);  // State for selected date
  const [inputDate, setInputDate] = useState<string>('');  // State for the input field value

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputDate(value);

    // Parse the input value to a date
    const parsedDate = new Date(value);
    if (!isNaN(parsedDate.getTime())) {
      setStartDate(parsedDate);  // Set the parsed date if valid
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    setStartDate(date || null);
    if (date) {
      setInputDate(format(date, 'yyyy-MM-dd'));
    } else {
      setInputDate(''); // Clear input when date is undefined
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Start Date
      </label>
      <div className="flex items-center space-x-2">
        {/* Input Field for Selected Date */}
        <Input
          type="text"
          value={inputDate}  // Bind inputDate to the input field
          onChange={handleInputChange}  // Handle input changes
          placeholder="YYYY-MM-DD"
          className="w-[200px]"
        />
        {/* Popover with Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="inline-flex items-center justify-center p-2 text-sm font-medium rounded-md border bg-white hover:bg-gray-100"
              aria-label="Pick a date"
            >
              <CalendarIcon className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={4}
            className="p-2 w-auto rounded-md border bg-white shadow-lg"
          >
            <Calendar
              selected={startDate || undefined}  // Bind Shadcn Calendar to startDate state
              onSelect={handleDateSelect}  // Handle date selection
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Error Message */}
      {false && <p className="text-red-500 text-sm mt-1">Error Message</p>}  {/* Add error handling logic here */}
    </div>
  );
};

export default DatePicker;
