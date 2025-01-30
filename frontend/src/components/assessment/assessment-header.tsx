"use client";

import { useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";

export default function AssessmentHeader() {
  const [selectedAssessment, setSelectedAssessment] = useState("all");
  const [selectedCreated, setSelectedCreated] = useState("all");
  const [viewMode, setViewMode] = useState<"today" | "week" | "calendar">("today");

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
    {/* Select Dropdowns */}
    <div className="flex flex-wrap items-center gap-3">
      <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
        <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-300">
          <SelectValue placeholder="Assessment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assessment</SelectItem>
          <SelectItem value="mern">MERN</SelectItem>
          <SelectItem value="mean">MEAN</SelectItem>
        </SelectContent>
      </Select>
  
      <Select value={selectedCreated} onValueChange={setSelectedCreated}>
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
          variant={viewMode === "today" ? "secondary" : "ghost"}
          size="sm"
          className={`${
            viewMode === "today" ? "bg-gray-100 dark:bg-gray-700" : ""
          } text-gray-900 dark:text-gray-300`}
          onClick={() => setViewMode("today")}
        >
          Today
        </Button>
        <Button
          variant={viewMode === "week" ? "secondary" : "ghost"}
          size="sm"
          className={`${
            viewMode === "week" ? "bg-gray-100 dark:bg-gray-700" : ""
          } text-gray-900 dark:text-gray-300`}
          onClick={() => setViewMode("week")}
        >
          Week
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              className={`${
                viewMode === "calendar" ? "bg-gray-100 dark:bg-gray-700" : ""
              } text-gray-900 dark:text-gray-300`}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Pick Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
              mode="single"
              selected={new Date()}
              onSelect={(date: Date | undefined) => {
                if (date) {
                  setViewMode("calendar");
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