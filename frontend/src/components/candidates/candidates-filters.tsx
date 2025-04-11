"use client"
import { cn } from "@/lib/utils";
import { AssessmentOption, CandidateFilter, TechnologyOption } from "@/types/candidate.types";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "../ui/form/button";
import { AssessmentFilter } from "./filters/assessment-filter";
import { FilterOptions } from "./filters/filter-options";
import { SearchFilter } from "./filters/search-filter";
import { TechnologyFilter } from "./filters/technology-filter";
import { api } from "@/lib/api";
import { useCandidateStore } from "@/store/candidateStore";
import debounce from "lodash/debounce";
import { ListFilterIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

const Filters = () => {

  const { data: assessments } = useSWR("/assessment/all", api.get, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    staleWhileRevalidate: true
  });
  const { data: technology } = useSWR("/technology/list", api.get, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    staleWhileRevalidate: true
  });

  const { setCandidateFilter,setAssessmentOptions,setTechnologyOptions, candidateList } = useCandidateStore()

  const assessmentOptions = useMemo(() => {

    const assessmentData= assessments?.data?.map((item: { id: string, name: string }) => ({ value: item.id, label: item.name })) || []
    setAssessmentOptions(assessmentData)
    return assessmentData

  }, [assessments])


  const technologyOptions = useMemo(() => {

    const technologyData = technology?.data?.list?.map((item: { id: string, name: string }) => ({ value: item.id, label: item.name })) || []
    setTechnologyOptions(technologyData)
    return technologyData
  }, [technology])

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
  
  const searchQuery = watch('searchQuery')
  const technologyFilter = watch('technologyFilter')
  const assessmentFilter = watch('assessmentFilter')
  const created = watch('created')
  const createdDays = watch('created.days')
  const createdRange = watch('created.range')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedApplyFilters = useCallback(
    debounce((data: Partial<CandidateFilter>) => {
      const payload: CandidateFilter = {
        searchQuery: data.searchQuery || "",
        technologyFilter: (data.technologyFilter || []).map((item: TechnologyOption) => ({value:item.value,label:item.label})),
        assessmentFilter: (data.assessmentFilter || []).map((item: AssessmentOption) => ({value:item.value,label:item.label})),
        created: data.created?.range ? {
          days: "",
          range: {
            from: data.created.range.from ? new Date(data.created.range.from.setHours(0, 0, 0, 0)) : undefined,
            to: data.created.range.to ? new Date(data.created.range.to.setHours(23, 59, 59, 999)) : undefined
          }
        } : undefined
      };
      console.log("logs 899999 payload",JSON.stringify(payload))
      setCandidateFilter(payload);
    }, 500),
    [setCandidateFilter]
  );

  const getData = ()=>{
    debouncedApplyFilters({
      searchQuery,
      technologyFilter,
      assessmentFilter,
      created: {
        days: createdDays,
        range: createdRange
      }
    });
  }

  useEffect(() => {
    console.log("created ",created)
    debouncedApplyFilters({
      searchQuery,
      technologyFilter,
      assessmentFilter,
      created: {
        days: createdDays,
        range: createdRange
      }
    });
  }, [searchQuery, technologyFilter, assessmentFilter, createdDays, createdRange, debouncedApplyFilters]);

  const clearAllFilters = () => {
    reset()
  };

  const isFilter = useMemo(() => {
    return Object.keys(watch()).some((key:string) => {
      const typedKey = key as keyof CandidateFilter;
      if (typedKey === "technologyFilter" || typedKey === "assessmentFilter") {
        return watch(typedKey).length > 0;
      } else if (typedKey === "created") {
        return watch(typedKey)?.days !== "" || watch(typedKey)?.range !== undefined;
      } else {
        return watch(typedKey) !== "";
      }
    });
  }, [watch]);



  return (
    <section className="w-full">

      <div className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap mb-2">
        <SearchFilter searchQuery={searchQuery} setSearchQuery={(value) => setValue('searchQuery', value)} />

        <TechnologyFilter
          value={technologyFilter}
          onChange={(value: TechnologyOption[]) => { setValue('technologyFilter', value) }}
          options={technologyOptions}
        />

        <AssessmentFilter
          value={assessmentFilter}
          onChange={(value: AssessmentOption[]) => setValue('assessmentFilter', value)}
          options={assessmentOptions}
        />

        <FilterOptions
          formData={watch()}
          setValue={setValue}
          register={register}
        />
        <Button className="ml-2 cursor-pointer" onClick={getData}>
          <ListFilterIcon size={30} />
        </Button>
      </div>
      <div className="flex justify-between items-center gap-4 flex-wrap mt-2 ml-2">
        <div className="flex items-center gap-2 min-w-fit shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Results found
          </h2>
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium">
            {candidateList.length}
          </span>
        </div>

        {isFilter && <Button
          variant="destructive"
          onClick={clearAllFilters}
          className={cn(
            "h-11 px-4 text-sm font-medium whitespace-nowrap",
            "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
            "focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          )}
        >
          Clear All
        </Button>}
      </div>
    </section>
  );
};

Filters.displayName = "Filters";
export default Filters;