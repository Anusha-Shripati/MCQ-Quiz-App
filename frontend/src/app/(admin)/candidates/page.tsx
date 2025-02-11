"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { FiCopy, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import CreateCandidateDialog from "@/components/candidates/create-candidate-dialog";
import { candidatesList } from "@/shared/constants/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/candidates/pagination-controls";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, useSearchParams, usePathname } from "next/navigation"; 
import type { Candidate } from "@/types/candidate.types";
import { Button } from "@/components/ui/button";
import type { TableProps, Column, ExpandableRow } from "@/components/candidates/candidates-table";
// import { Candidate } from "@/types/candidate.types";
const FiltersCandidates = dynamic(() => import("@/components/candidates/candidates-filters"), {
  suspense: true,
});
const ReusableTable = dynamic(() => 
  import("@/components/candidates/candidates-table").then(mod => 
    mod.default as React.FC<TableProps<Candidate>>
  )
);


export default function Candidates() {

  const [openCreateCandidate, setOpenCreateCandidate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredCandidates, ] = useState(candidatesList);

  const router = useRouter(); 
  const pathname = usePathname();
  const searchParams = useSearchParams();
 
  const totalItems = candidatesList.length;
  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return candidatesList.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage]);


  const formatTestDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in hours
    const duration = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return `${duration} hours`; // e.g., "3 hours"
  };

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



  const columns = useMemo<Array<Column<Candidate>>>(
    () => [
      { key: "testDate", header: "Test Date" },
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "technology", header: "Technology" },
      { key: "experience", header: "Exp." },
      { key: "assessment", header: "Assessment" },
      {
        key: "result",
        header: "Result",
        render: (row:Candidate) => (
          <span className={`font-semibold ${row.result === "Pass" ? "text-green-600" : "text-red-600"}`}>
            {row.result}
          </span>
        ),
      },
      { key: "created", header: "Created" },
      {
        key: "actions",
        header: "Share",
        render: () => (
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText("https://example.com/candidate-link");
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
          </div>
        ),
      },
    ],
    []
  );

  const expandableRow: ExpandableRow<Candidate> = {
    render: (row: Candidate) => (
      <div className="border border-gray-200 rounded-lg p-4 space-y-6 transition-all duration-300 ease-in-out transform origin-top animate-in fade-in zoom-in-95">
        {/* Row Layout */}
        <div className="flex items-center justify-between">
          {/* Result Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Result</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-blue-500">{row?.details?.totalPercentage}</p>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                View Answer
              </a>
            </div>
          </div>

          {/* Test Time Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Test Time</p>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {formatTestDuration(row?.testStartTime, row?.testEndTime)}
                </p>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {formatTestDateRange(row?.testStartTime, row?.testEndTime)}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Created Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Created</p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{row?.details?.createdBy}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">{row?.details?.createdOn}</p>
          </div>
        </div>

        {/* Detailed Table */}
        <div>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead className="dark:text-gray-800">
              <tr className="dark:bg-gray-500 dark:text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">Total Percentage</th>
                {/* Dynamically render category headers */}
                {Object.keys(row?.details?.categories ?? {}).map((category) => (
                  <th key={category} className="border border-gray-300 px-4 py-2 text-left">
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">{row?.details?.totalPercentage}</td>
                {/* Dynamically render category percentages */}
                {Object.values(row?.details?.categories ?? {}).map((percentage, index) => (
                  <td key={index} className="border border-gray-300 px-4 py-2">
                    {percentage as string}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  };

  // Add this function to handle query param updates
  const updateQueryParams = (params: { page?: string; perPage?: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (params.page) newParams.set('page', params.page);
    if (params.perPage) newParams.set('perPage', params.perPage);
    
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  // Initialize state from query params
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const perPageParam = searchParams.get('perPage');
    
    if (pageParam) setCurrentPage(Number(pageParam));
    if (perPageParam) setItemsPerPage(Number(perPageParam));
  }, [searchParams]);

  return (
    // Main container
    <div className="p-4 sm:p-6 dark:bg-gray-900 min-h-screen">
      {/* Candidate page header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 ">
          All Candidates &amp; Results
        </h1>
        <CreateCandidateDialog
          open={openCreateCandidate}
          onOpenChange={setOpenCreateCandidate}
        />
      </div>

      {/* Filters */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <FiltersCandidates candidates={filteredCandidates} />
      </Suspense>

      {/* Candidate info table */}
      <Suspense fallback={<div>Loading table...</div>}>
        <ReusableTable
          columns={columns}
          rows={currentItems}
          expandableRow={expandableRow}
          className="mb-6 animate-in fade-in duration-300"
          rowKey="id"

        />
      </Suspense>

      {/* Add results count */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
          Showing {currentPageStart}-{currentPageEnd} of {totalItems}
        </div>

        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Results per page</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
              updateQueryParams({ perPage: value, page: '1' });
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalItems={candidatesList.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          updateQueryParams({ page: page.toString() });
        }}
      />

    </div>
  );
}