"use client";

import React, { Suspense, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
import { FiCopy, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import CreateCandidateDialog from "@/components/candidates/create-candidate-dialog";
import { candidatesList } from "@/shared/constants/data";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/candidates/pagination-controls";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
const FiltersCandidates = dynamic(() => import("@/components/candidates/candidates-filters"), {
  suspense: true,
});
const ReusableTable = dynamic(() => import("@/components/candidates/candidates-table"), {
  suspense: true,
});


// Define types for Candidate and CandidateDetails
interface CandidateDetails {
  totalPercentage: string;
  categories: {
    [key: string]: string;
  };
  createdBy: string;
  createdOn: string;
}

interface Candidate {
  id: number;
  date: string;
  testDate: string;
  name: string;
  email: string;
  technology: string;
  experience: string;
  assessment: string;
  result: string;
  created: string;
  testStartTime: string;
  testEndTime: string;
  details: CandidateDetails;
}

interface ExpandableRow {
  render: (row: Candidate) => React.ReactNode; // Function to render the expandable content
}

// interface Column {
//   key: string; // Unique key for the column
//   header: string; // Display name for the column header
//   render?: (row: any) => JSX.Element; // Optional function to render custom content for the column
// }


export default function Candidates() {

  const [openCreateCandidate, setOpenCreateCandidate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = candidatesList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return candidatesList.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage]);

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, currentPage + 3);

    if (totalPages > maxVisiblePages) {
      if (currentPage <= 4) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 3) {
        startPage = totalPages - maxVisiblePages + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          className="mx-1 min-w-[2rem]"
        >
          {i}
        </Button>
      );
    }

    if (totalPages > maxVisiblePages) {
      if (startPage > 1) {
        pages.unshift(
          <span key="start-ellipsis" className="px-3 py-1">
            ...
          </span>
        );
      }
      if (endPage < totalPages) {
        pages.push(
          <span key="end-ellipsis" className="px-3 py-1">
            ...
          </span>
        );
      }
    }

    return pages;
  };

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


  // Sample candidate data

  const candidates = useMemo(() =>
    candidatesList
    , [])

  const columns = useMemo(
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
        render: (row) => (
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText("https://example.com/candidate-link");
                toast.success("Link copied to clipboard!");
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <FiCopy className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "mailto:candidate@example.com";
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <FiMail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        ),
      },
    ],
    [] // Empty dependency array because the columns array is static
  );

  const expandableRow: ExpandableRow = {
    render: (row) => (
      <div className="border border-gray-200 rounded-lg p-4 space-y-6 transition-all duration-300 ease-in-out transform origin-top animate-in fade-in zoom-in-95">
        {/* Row Layout */}
        <div className="flex items-center justify-between">
          {/* Result Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Result</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-blue-500">{row.details.totalPercentage}</p>
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
                  {formatTestDuration(row.testStartTime, row.testEndTime)}
                </p>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {formatTestDateRange(row.testStartTime, row.testEndTime)}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Created Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Created</p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{row.details.createdBy}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">{row.details.createdOn}</p>
          </div>
        </div>

        {/* Detailed Table */}
        <div>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead className="dark:text-gray-800">
              <tr className="dark:bg-gray-500 dark:text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">Total Percentage</th>
                {/* Dynamically render category headers */}
                {Object.keys(row.details.categories).map((category) => (
                  <th key={category} className="border border-gray-300 px-4 py-2 text-left">
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">{row.details.totalPercentage}</td>
                {/* Dynamically render category percentages */}
                {Object.values(row.details.categories).map((percentage, index) => (
                  <td key={index} className="border border-gray-300 px-4 py-2">
                    {percentage}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  };
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


      {/* Filters */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <FiltersCandidates candidates={candidates} />
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

      <PaginationControls
        currentPage={currentPage}
        totalItems={candidatesList.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}