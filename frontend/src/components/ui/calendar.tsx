"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn, getShadePerInterviewsCount } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useTheme } from "next-themes";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

type CalendarWithHoverProps = CalendarProps & {
  classNames?: CalendarProps["classNames"];
  className?: string;
  showOutsideDays?: boolean;
  exams: Exam[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarWithHoverProps) {
  const { theme } = useTheme();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-6 bg-gradient-to-br backdrop-blur-lg  rounded-2xl",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6 w-full h-full",
        month: "space-y-4 flex flex-col justify-around w-full h-full ",
        caption: "flex justify-between items-center text-lg font-bold",
        nav: "flex space-x-2 items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 bg-white/70 backdrop-blur-md rounded-full shadow hover:scale-110 hover:bg-gradient-to-br from-gray-200 to-gray-300 transition-transform"
        ),
        table: "w-full",
        head_row: "flex h-10",
        head_cell: "text-lg font-semibold w-full text-center tracking-wide",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center flex-1",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-lg"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-medium rounded-full transition-all duration-200 hover:bg-gradient-to-br from-blue-100 to-blue-200 shadow hover:scale-105"
        ),
        day_selected:
          "bg-gradient-to-br from-blue-500 to-blue-700 font-semibold shadow-lg scale-110 border border-blue-800",
        day_today:
          "bg-gradient-to-br from-green-400 to-green-500 font-bold border border-green-600 shadow-lg",
        day_outside: "text-gray-300",
        day_disabled: "text-gray-200",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn(
              "h-6 w-6 text-gray-700 hover:text-gray-900",
              className
            )}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn(
              "h-6 w-6 text-gray-700 hover:text-gray-900",
              className
            )}
            {...props}
          />
        ),
        Day: ({ date }) => {
          const { exams } = props;
          const today = format(new Date(), "yyyy-MM-dd");
          const formattedDate = format(date, "yyyy-MM-dd");
          const isToday = today === formattedDate;
          const dayInterviews = exams.filter((e) => e.date === formattedDate);

          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  className={cn(
                    "h-12 w-12 p-0 font-medium rounded-full transition-all duration-300 hover:bg-secondary hover:text-secondary-foreground",
                    getShadePerInterviewsCount(
                      dayInterviews.length,
                      "stone",
                      isToday ? "green" : "",
                      theme
                    )
                  )}
                >
                  {date.getDate()}
                </button>
              </HoverCardTrigger>

              {dayInterviews.length > 0 ? (
                <HoverCardContent className="bg-white p-5 rounded-lg shadow-2xl border border-gray-200 backdrop-blur-lg">
                  <div className="text-sm">
                    <p className="font-semibold mb-2 text-gray-700">
                      {dayInterviews.length} Interview
                      {dayInterviews.length > 1 ? "s" : ""}:
                    </p>
                    <ul className="space-y-2">
                      {dayInterviews.map((interview, index) => (
                        <li key={index} className="flex flex-col">
                          <p className="font-medium text-gray-800">
                            {interview.task}
                          </p>
                          <p className="text-gray-600">
                            Candidate: {interview.candidate}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </HoverCardContent>
              ) : (
                <HoverCardContent className="bg-white p-5 rounded-lg shadow-2xl border border-gray-200 backdrop-blur-lg">
                  <div className="text-sm">
                    <p className="font-semibold mb-2 text-gray-700">
                      No interviews on this day
                    </p>
                  </div>
                </HoverCardContent>
              )}
            </HoverCard>
          );
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

