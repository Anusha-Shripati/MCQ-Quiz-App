"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, CalendarIcon } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { Controller, useForm } from "react-hook-form";

export default function AssessmentHeader() {

  const defaultValues={ assessment: 'all', createdBy: "all", date: new Date(), view: 'today' } 

  const { control,register, setValue, watch} = useForm({ defaultValues })
  const allFields = watch();

  const handleViewChange = (view:string) => setValue("view", view);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, [allFields]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <Controller
          name="assessment"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300">
                <SelectValue placeholder="Assessment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assessment</SelectItem>
                <SelectItem value="mern">MERN</SelectItem>
                <SelectItem value="mean">MEAN</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <Select {...register('createdBy')} onValueChange={(value) => setValue('createdBy', value)} >
          <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300">
            <SelectValue placeholder="Created" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Created</SelectItem>
            <SelectItem value="mihir">Mihir</SelectItem>
            <SelectItem value="john">John</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Mode and Create Button */}
      <div className="flex flex-wrap items-center gap-4 ml-auto">
        {/* View Mode Buttons */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
          <Button
            variant={allFields.view === "today" ? "secondary" : "ghost"}
            size="sm"
            className={`${allFields.view === "today" ? "bg-gray-100 dark:bg-gray-700" : ""
              } text-gray-900 dark:text-gray-300`}
              onClick={() => handleViewChange("today")}
          >
            Today
          </Button>
          <Button
            variant={allFields.view === "week" ? "secondary" : "ghost"}
            size="sm"
            className={`${allFields.view === "week" ? "bg-gray-100 dark:bg-gray-700" : ""
              } text-gray-900 dark:text-gray-300`}
              onClick={() => handleViewChange("week")}
          >
            Week
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={allFields.view === "calendar" ? "secondary" : "ghost"}
                size="sm"
                className={`${allFields.view === "calendar" ? "bg-gray-100 dark:bg-gray-700" : ""
                  } text-gray-900 dark:text-gray-300`}
                  onClick={() => handleViewChange("calendar")}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Pick Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
                mode="single"
                selected={allFields.date}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    handleViewChange("calendar")
                    setValue('date', date)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Create Assessment Button */}
        <Link href="/assessment/create-assessment">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
