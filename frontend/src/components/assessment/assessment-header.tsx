"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/form/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { ListFilterIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { DateRange } from "@/types/common.types";
import { AssessmentFilters } from "@/store/assessmentStore";
import DatePickerWithRange from "../ui/form/date-range-picker";

export default function AssessmentHeader() {

  const defaultValues = { assessment: 'all', createdBy: "all", date: undefined, view: 'today' }

  const { control, register, setValue, watch } = useForm<AssessmentFilters>({ defaultValues })
  const allFields = watch();

  const handleViewChange = (view: string) => {
    if (view != 'calander') {
      setValue('date', undefined)
    }
    setValue("view", view)
  };
  const isFirstRender = useRef(true);

  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     isFirstRender.current = false;
  //     return;
  //   }
  // }, [allFields]);

  const getData = () => {
    console.log(allFields);
  }

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
          <DatePickerWithRange selected={allFields.date} onSelect={(date: DateRange | undefined) => {
            if (date) {
              handleViewChange("calendar")
              setValue('date', date)
            }
          }} />
        </div>
        <Button className="ml-2 cursor-pointer" onClick={getData}>
          <ListFilterIcon size={30} />
        </Button>

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
