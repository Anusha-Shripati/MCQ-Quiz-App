"use client";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { exams } from "@/shared/constants/data";

export default function CalendarCard() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border h-full w-full"
      exams={exams || []}
    />
  );
}
