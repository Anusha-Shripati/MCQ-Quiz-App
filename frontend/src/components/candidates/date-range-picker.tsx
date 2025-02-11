"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const DateRangePicker: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex items-center gap-1"> {/* Reduced gap between buttons */}
      {/* Start Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-xs h-8 px-2.5" // Smaller button size
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" /> {/* Smaller icon */}
            {startDate ? format(startDate, "PP") : "Start"} {/* Shorter date format */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => setStartDate(date || undefined)}
            initialFocus
            className="text-xs" // Smaller calendar text
          />
        </PopoverContent>
      </Popover>

      {/* End Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-xs h-8 px-2.5" // Smaller button size
          >
            <CalendarIcon className="h-4 w-4 mr-1.5" /> {/* Smaller icon */}
            {endDate ? format(endDate, "PP") : "End"} {/* Shorter date format */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => setEndDate(date || undefined)}
            initialFocus
            disabled={startDate ? { before: startDate } : undefined}
            className="text-xs" // Smaller calendar text
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;