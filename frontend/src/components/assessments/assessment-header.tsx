"use client";

import { Button } from "@/components/ui/form/button";
import { ListFilterIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { DateRange, User } from "@/types/common.types";
import { AssessmentFilters, useAssessmentStore } from "@/store/assessmentStore";
import DatePickerWithRange from "../ui/form/date-range-picker";
import { useMemo } from "react";
import { FormField } from "../common/form-field";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export default function AssessmentHeader() {
  const defaultValues: AssessmentFilters = {
    name: "",
    created_by: "all",
    created_duation: {
      from: undefined,
      to: undefined,
    },
    view: "today",
  };

  const { data: users } = useSWR("/user/list", fetcher);
  const { setFilters } = useAssessmentStore();

  const { control, setValue, watch, register } = useForm<AssessmentFilters>({
    defaultValues,
  });
  const allFields = watch();

  const headerUsersOptions = useMemo(() => {
    if (users) {
      return [
        { label: "All", value: "all" },
        ...users.data.list.map((user: User) => ({
          label: user.name,
          value: user.id,
        })),
      ];
    }
    return [];
  }, [users]);

  const handleViewChange = (view: string) => {
    if (view == "today")
      setValue("created_duation", {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(new Date().setHours(23, 59, 59, 999)),
      });
    else if (view == "week")
      setValue("created_duation", {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      });
    setValue("view", view);
  };

  const handleDateChange = (date: DateRange | undefined) => {
    if (date) {
      handleViewChange("calendar");
      setValue("created_duation", date);
    }
  };

  const handleFilterClick = () => {
    setFilters(allFields);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <FormField
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300 min-w-[200px]"
          type="text"
          value={allFields.name}
          placeholder="Search by name"
          {...register("name")}
        />
        <Controller
          name="created_by"
          control={control}
          render={({ field }) => (
            <FormField
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300 min-w-[200px]"
              type="select"
              onChange={field.onChange}
              value={field.value}
              placeholder="created_by"
              options={headerUsersOptions}
            />
          )}
        />
      </div>

      {/* View Mode and Create Button */}
      <div className="flex flex-wrap items-center gap-4 ml-auto">
        {/* View Mode Buttons */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-600">
          <Button
            variant={allFields.view === "today" ? "secondary" : "ghost"}
            size="sm"
            className={`${
              allFields.view === "today" ? "bg-gray-100 dark:bg-gray-700" : ""
            } text-gray-900 dark:text-gray-300`}
            onClick={() => handleViewChange("today")}
          >
            Today
          </Button>
          <Button
            variant={allFields.view === "week" ? "secondary" : "ghost"}
            size="sm"
            className={`${
              allFields.view === "week" ? "bg-gray-100 dark:bg-gray-700" : ""
            } text-gray-900 dark:text-gray-300`}
            onClick={() => handleViewChange("week")}
          >
            Week
          </Button>
          <DatePickerWithRange
            selected={allFields.created_duation}
            onSelect={handleDateChange}
          />
        </div>
        <Button className="ml-2 cursor-pointer" onClick={handleFilterClick}>
          <ListFilterIcon size={30} />
        </Button>

        <Link href="/assessments/create-assessment">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
