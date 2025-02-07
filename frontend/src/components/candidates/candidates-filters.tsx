// Filters component (main file)
import React, { useState, memo } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { FiltersProps, TechnologyOption, StatusOption } from "@/types/candidate.types";
import { SearchFilter } from "./filters/search-filter";
import { TechnologyFilter } from "./filters/technology-filter";
import { FilterOptions } from "./filters/filter-options";
import { AssessmentFilter } from "./filters/assessment-filter";

const technologyOptions: TechnologyOption[] = [
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'mongodb', label: 'MongoDB' },
];

const assessmentOptions: StatusOption[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'not-started', label: 'Not Started' },
  { value: 'expired', label: 'Expired' },
  { value: 'in-progress', label: 'In Progress' },
];

const Filters = memo(({ candidates = [] }: FiltersProps) => {
  const [activeFilter, setActiveFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [technologyFilter, setTechnologyFilter] = useState<TechnologyOption[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<[string, string]>(["", ""]);
  const [assessmentFilter, setAssessmentFilter] = useState<StatusOption[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);

  const handleOpenFilter = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? "" : filterName);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setTechnologyFilter([]);
    setExperienceFilter(["", ""]);
    setAssessmentFilter([]);
    setDateRange(["", ""]);
    setActiveFilter("");
  };

  return (
    <section className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* First Row - Title, Count, and Clear Button */}
     

      {/* Second Row - Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap mb-2">
        <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <TechnologyFilter 
          value={technologyFilter}
          onChange={setTechnologyFilter}
          options={technologyOptions}
        />

        <AssessmentFilter 
          value={assessmentFilter}
          onChange={setAssessmentFilter}
          options={assessmentOptions}
        />

        <FilterOptions 
          activeFilter={activeFilter}
          handleOpenFilter={handleOpenFilter}
          experienceFilter={experienceFilter}
          assessmentFilter={assessmentFilter}
          dateRange={dateRange}
          setAssessmentFilter={setAssessmentFilter}
        />
      </div>
      <div className="flex justify-between items-center gap-4 flex-wrap mt-2 ml-2">
        <div className="flex items-center gap-2 min-w-fit shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Results found
          </h2>
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium">
            {candidates.length}
          </span>
        </div>

        <Button
          variant="destructive"
          onClick={clearAllFilters}
          className={cn(
            "h-11 px-4 text-sm font-medium whitespace-nowrap",
            "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
            "focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          )}
        >
          Clear All
        </Button>
      </div>
    </section>
  );
});

Filters.displayName = "Filters";
export default Filters;