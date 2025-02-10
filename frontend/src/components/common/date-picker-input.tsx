import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface DatePickerInputProps {
  label: string;
  date?: Date;
  setDate: (date?: Date) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  error?: string;
}

export const DatePickerInput = ({
  label,
  date,
  setDate,
  isOpen,
  setIsOpen,
  error
}: DatePickerInputProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={date ? formatDate(date) : ''}
            readOnly
            className="cursor-pointer pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border bg-white"
          initialFocus
        />
      </PopoverContent>
    </Popover>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
); 