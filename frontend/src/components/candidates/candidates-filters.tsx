// Filters component (main file)
"use client"
import React, { memo, useEffect } from "react";
import { Button } from "../ui/form/button";
import { cn } from "@/lib/utils";
import { AssessmentOption, CandidateFilter, FiltersProps, TechnologyOption } from "@/types/candidate.types";
import { SearchFilter } from "./filters/search-filter";
import { TechnologyFilter } from "./filters/technology-filter";
import { FilterOptions } from "./filters/filter-options";
import { AssessmentFilter } from "./filters/assessment-filter";
import { assessmentOptions, technologyOptions } from "@/shared/constants/data";
import { useForm } from "react-hook-form";
import { ListFilterIcon } from "lucide-react";

const Filters = memo(({ candidates = [] }: FiltersProps) => {

  const defaultValues: CandidateFilter = {
    searchQuery: "",
    technologyFilter: [],
    assessmentFilter: [],
    created: {
      days: "",
      range: undefined
    },
  }
  const { setValue, watch, reset, register } = useForm<CandidateFilter>({ defaultValues })
  const formData = watch()
  const clearAllFilters = () => {
    reset()
  };
  const getData = () => {
    console.log(formData);
  }



  return (
    <section className="w-full">

      <div className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap mb-2">
        <SearchFilter searchQuery={formData.searchQuery} setSearchQuery={(value) => setValue('searchQuery', value)} />

        <TechnologyFilter
          value={formData.technologyFilter}
          onChange={(value: TechnologyOption[]) => {setValue('technologyFilter', value)}}
          options={technologyOptions}
        />

        <AssessmentFilter
          value={formData.assessmentFilter}
          onChange={(value: AssessmentOption[]) => setValue('assessmentFilter', value)}
          options={assessmentOptions}
        />

        <FilterOptions
          formData={formData}
          setValue={setValue}
          register={register}
        />
        <Button className="ml-2 cursor-pointer" onClick={getData}>
          <ListFilterIcon size={30}/>
        </Button>
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