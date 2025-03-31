"use client";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { DateRange } from "@/types/common.types";

type CalendarDate = Date | undefined | DateRange;

export default function CalendarCard() {
  const [date, setDate] = useState<CalendarDate>(new Date());

  return (
      <Calendar
        mode="range"
        selected={date as DateRange} // Ensure compatibility with Calendar's selected prop
        onSelect={(value) => setDate(value as CalendarDate)} // Type assertion for safety
        className="dashboard-calander rounded-md border h-full w-full"
      />
  );
}
