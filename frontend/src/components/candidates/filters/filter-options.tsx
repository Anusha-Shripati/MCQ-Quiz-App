import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import DateRangePicker from "../../ui/form/date-range-picker";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

import * as  Popover from "@radix-ui/react-popover";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useEffect, useState } from "react";
import { CandidateFilter } from "@/types/candidate.types";
import { DateRange } from "@/types/common.types";

interface FilterOptionsProps {
  formData: CandidateFilter;
  setValue: UseFormSetValue<CandidateFilter>;
  register: UseFormRegister<CandidateFilter>;
}

export function FilterOptions({
  formData,
  setValue,
  register,

}: FilterOptionsProps) {
  useEffect(() => {
    setValue('experience.range', '')
  }, [formData?.experience?.min || formData?.experience?.max])
  const [activeFilter, setActiveFilter] = useState("");


  const handleOpenFilter = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? "" : filterName);
  };
  const renderFilterContent = (filter: string) => {

    const handleExpRange = (value: string) => {
      setValue('experience.min', null)
      setValue('experience.max', null)
      setValue('experience.range', value)
    }
    const handelDateButton = (value: string) => {
      setValue('created.days', value)
      if(value == 'Last 7 Days'){
        setValue('created.range', { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date(Date.now()) })
      }else if(value == 'Last 30 Days'){
        setValue('created.range', { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date(Date.now()) })
      }
    }
    const handleDateRange = (e: DateRange) => {
      setValue('created.days', '');
      setValue('created.range', e)
    }

    switch (filter) {
      case "experience":
        return (
          <div className="space-y-4 w-64">
            <div className="flex items-center gap-4">
              <Input type="number" placeholder="Min" className="w-20" {...register('experience.min')} />
              <span className="text-gray-500">to</span>
              <Input type="number" placeholder="Max" className="w-20" {...register('experience.max')} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="text-sm" onClick={() => handleExpRange('0–2 years')}>0–2 years</Button>
              <Button variant="outline" className="text-sm" onClick={() => handleExpRange('3–5 years')}>3–5 years</Button>
              <Button variant="outline" className="text-sm" onClick={() => handleExpRange('5 years')}>5+ years</Button>
            </div>
          </div>
        );

      case "created":
        return (
          <div className="space-y-2">
            <DateRangePicker onSelect={(e: DateRange | undefined) => { handleDateRange(e as DateRange) }} selected={formData.created?.range} />
            <div className="flex gap-2 flex-wrap">
              <Button variant={formData?.created?.days == 'Last 7 Days' ? 'default' : "outline"} onClick={() => handelDateButton('Last 7 Days')} className="text-sm">Last 7 Days</Button>
              <Button variant={formData?.created?.days == 'Last 30 Days' ? 'default' : "outline"} onClick={() => handelDateButton('Last 30 Days')} className="text-sm">Last 30 Days</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0 z-10">
      {["Created"].map((filter) => (
        <Popover.Root key={filter} onOpenChange={() => { handleOpenFilter(filter.toLowerCase()) }}>
          <Popover.Trigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className={cn(
                  "h-11 text-sm font-medium gap-2 whitespace-nowrap",
                  "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  "transition-all duration-200",
                  activeFilter === filter.toLowerCase() && "border-blue-500 dark:border-blue-400"
                )}
              >
                {filter}
                {activeFilter === filter.toLowerCase() ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

            </div>
          </Popover.Trigger>
          <Popover.Portal>

            <Popover.Content className="z-10">
              <div className={cn(
                "mt-2 w-72 bg-white dark:bg-gray-900",
                "border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg",
                "p-4 transform origin-top",
              )}>
                {renderFilterContent(filter.toLowerCase())}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ))}
    </div>
  );
} 