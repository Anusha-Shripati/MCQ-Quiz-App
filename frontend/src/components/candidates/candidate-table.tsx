"use client";

import Error from "@/app/error";
import DialogForm from "@/components/candidates/dialog-form";
import type { Column, ExpandableRow } from "@/components/common/reusable-table";
import ReusableTable from "@/components/common/reusable-table";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/form/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, deleteData, isAxiosError } from "@/lib/api";
import { useCandidateStore } from "@/store/candidateStore";
import type { AssessmentOption, Candidate, CandidateFormData, TechnologyOption } from "@/types/candidate.types";
import { format } from 'date-fns';
import dayjs from "dayjs";
import { Edit, Trash2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import qs from 'query-string';
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCopy, FiMail } from "react-icons/fi";
import useSWR, { mutate } from "swr";

function CandidateTable() {

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const searchParams = useSearchParams();
  const [selectedCandidate, setSelectedCandidate] = useState<null | CandidateFormData>(
    null
  );
  const [open, setOpen] = useState(false);
  const { candidateFilter, setCandidateListData, candidateCount, candidateList } = useCandidateStore()
  const totalItems = candidateCount;

  const queryObj = useMemo(() => ({
    page: currentPage || 1,
    limit: itemsPerPage || 10,
    ...candidateFilter,
    search: candidateFilter.searchQuery,
    technologyFilter: candidateFilter.technologyFilter.map((item: TechnologyOption) => item.value),
    assessmentFilter: candidateFilter.assessmentFilter.map((item: AssessmentOption) => item.value),
    created: candidateFilter.created ? JSON.stringify(candidateFilter.created) : undefined
  }), [currentPage, itemsPerPage, candidateFilter]);


  const cleanedQuery = useMemo(() => qs.stringify(queryObj, {
    skipNull: true,
    skipEmptyString: true
  }), [queryObj]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: candidateData, error, isLoading } = useSWR(`/candidate/list?${cleanedQuery}`, api.get)

  useEffect(() => {
    
    if (candidateData?.data?.list) {
      const res =JSON.parse(JSON.stringify(candidateData.data.list))
      const candidateRes= res.map((item: any) => {
        item.assessment.technologies = item.assessment.technologies.map((inner: { technology: { id: string, name: string } }) => inner.technology)
        return item
      })
      setCandidateListData(candidateData.data.total, candidateRes)
    }
  }, [candidateData])

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const perPageParam = searchParams.get("perPage");

    if (pageParam) setCurrentPage(Number(pageParam));
    if (perPageParam) setItemsPerPage(Number(perPageParam));
  }, [searchParams]);

  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page.toString() });
  };

  const pathname = usePathname();

  const updateQueryParams = (params: { page?: string; perPage?: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (params.page) newParams.set("page", params.page);
    if (params.perPage) newParams.set("perPage", params.perPage);
    window.history.pushState(null, "", `${pathname}?${newParams.toString()}`);
  };

  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    return candidateList;
  }, [candidateList]);

  const formatTestDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in hours
    const duration =
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return `${duration} hours`; // e.g., "3 hours"
  };


  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await deleteData(`/candidate/${id}`)
        if (res.success) {
          toast.success("Assessment deleted successfully");
        }
        mutate((key) => typeof key === 'string' && key.startsWith('/candidate/list'));
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response.data.message || "An unexpected error occurred");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  }


  const formatTestDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${startTime}–${endTime}`; // e.g., "09:00 AM–12:00 PM"
  };
  const handleEdit = (candidate: Candidate) => {
    const obj: CandidateFormData = {
      ...candidate,
      assessment: candidate.assessment?.id as string,
      technology: candidate.assessment?.technologies ? candidate.assessment?.technologies.map(item=>item.name).join(', ') as string:"",
      startDate: new Date(candidate.exam?.start_time as string),
      endDate: new Date(candidate.exam?.end_time as string),
      timeUnit: 'days',
      timeValue: dayjs(candidate.exam?.end_time as string).diff(
        dayjs(candidate.exam?.start_time as string),
        "days"
      ),
    }

    setSelectedCandidate(obj);
    setOpen(true);
  };

  const columns = useMemo<Array<Column<Candidate>>>(
    () => [
      {
        key: "exam.start_time",
        header: "Test Date",
        render: (row) => row.exam?.start_time ? format(new Date(row.exam.start_time), 'MMM dd, yyyy hh:mm a') : '-'
      },
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "technology", header: "Technology", render: (row) => row.assessment?.technologies ? row.assessment?.technologies.map(item=>item.name).join(',') : '-' },
      { key: "experience", header: "Exp." },
      { key: "assessment.name", header: "Assessment" },
      // {
      //   key: "results",
      //   header: "Result",
      //   render: (row) => (
      //     <span
      //       className={`font-semibold ${row.results === "Pass" ? "text-green-600" : "text-red-600"}`}
      //     >
      //       {row.results}
      //     </span>
      //   ),
      // },
      {
        key: "created_at",
        header: "Created",
        render: (row) => format(new Date(row.created_at), 'MMM dd, yyyy hh:mm a')
      },
      {
        key: "actions",
        header: "Share",
        render: (candidate: Candidate) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(
                  "https://example.com/candidate-link"
                );
                toast.success("Link copied to clipboard!");
              }}
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <FiCopy className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "mailto:candidate@example.com";
              }}
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <FiMail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              onClick={() => handleEdit(candidate)}
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(candidate.id as string)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const expandableRow: ExpandableRow<Candidate> = {
    render: (row: Candidate) => (
      <div className="border border-gray-200  p-4 space-y-6 rounded-lg transition-all duration-300 ease-in-out transform origin-top animate-in fade-in zoom-in-95">
        {/* Row Layout */}
        <div className="flex items-center justify-between">
          {/* Result Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Result</p>
            <div className="flex items-center gap-2">
              {/* <p className="text-lg font-semibold text-blue-500">
                {row?.details?.totalPercentage}
              </p>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                View Answer
              </a> */}
            </div>
          </div>

          {/* Test Time Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Test Time
            </p>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {formatTestDuration(row?.exam?.start_time as string, row?.exam?.end_time as string)}
                </p>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {formatTestDateRange(row?.exam?.start_time as string, row?.exam?.end_time as string)}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Created Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Created</p>
            {/* <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {row?.details?.createdBy}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {row?.details?.createdOn}
            </p> */}
          </div>
        </div>

        {/* Detailed Table */}
        <div>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead className="dark:text-gray-800">
              <tr className="dark:bg-gray-500 dark:text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Total Percentage
                </th>
                {/* Dynamically render category headers */}
                {/* {Object.keys(row?.details?.categories ?? {}).map((category) => (
                    <th
                      key={category}
                      className="border border-gray-300 px-4 py-2 text-left"
                    >
                      {category}
                    </th>
                  ))} */}
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* <td className="border border-gray-300 px-4 py-2">
                  {row?.details?.totalPercentage}
                </td> */}
                {/* Dynamically render category percentages */}
                {/* {Object.values(row?.details?.categories ?? {}).map(
                  (percentage, index) => (
                    <td
                      key={index}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {percentage as string}
                    </td>
                  )
                )} */}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  };


  if (error) {
    return <div className="h-[500px]"><Error error={error} reset={() => window.location.reload()} /></div>
  }

  return (
    <>
      <Pagination
        className="flex-grow"
        currentPageStart={currentPageStart}
        currentPageEnd={currentPageEnd}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPerPageChange={handlePerPageChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        loading={isLoading}
      >
        <div className="min-h-[500px]">
          <ReusableTable
            columns={columns}
            rows={currentItems}
            expandableRow={expandableRow}
            className="mb-6 "
            rowKey="id"
          />
        </div>
      </Pagination>
      <DialogForm candidate={selectedCandidate} open={open} setOpen={setOpen} />
    </>
  );
}

export default CandidateTable;
