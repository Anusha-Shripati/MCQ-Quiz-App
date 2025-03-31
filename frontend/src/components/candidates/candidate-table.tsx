"use client";

import Pagination from "@/components/pagination";
import { candidatesList } from "@/shared/constants/data";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import type { Candidate } from "@/types/candidate.types";
import { Button } from "@/components/ui/form/button";
import type { Column, ExpandableRow } from "@/components/common/reusable-table";
import { FiCopy, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DialogForm from "@/components/candidates/dialog-form";
import { Edit } from "lucide-react";
import dayjs from "dayjs";
import ReusableTable from "@/components/common/reusable-table";
function CandidateTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const searchParams = useSearchParams();
  const [selectedCandidate, setSelectedCandidate] = useState<null | Candidate>(
    null
  );
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = candidatesList.length;

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const perPageParam = searchParams.get("perPage");

    if (pageParam) setCurrentPage(Number(pageParam));
    if (perPageParam) setItemsPerPage(Number(perPageParam));
  }, [searchParams]);

  // const ReusableTable = dynamic(() =>
  //     import("@/components/common/reusable-table").then(mod =>
  //         mod.default as React.FC<TableProps<Candidate>>
  //     ), { ssr: false, loading: () => <Loading /> }
  // );
  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    updateQueryParams({ perPage: value, page: "1" });
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page.toString() });
  };
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
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return candidatesList.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage]);

  const formatTestDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in hours
    const duration =
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);

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
  const handleEdit = (candidate: Candidate) => {
    const obj: Candidate & {
      startDate: Date;
      endDate: Date;
      timeUnit: string;
      timeValue: number;
    } = {
      ...candidate,
      startDate: new Date(candidate.testStartTime),
      endDate: new Date(candidate.testEndTime),
      timeUnit: "days",
      timeValue: dayjs(candidate.testStartTime).diff(
        dayjs(candidate.testEndTime),
        "days"
      ),
    };
    obj.startDate = new Date(candidate.testStartTime);
    obj.endDate = new Date(candidate.testStartTime);
    obj.timeUnit = "days";
    obj.timeValue = dayjs(candidate.testStartTime).diff(
      dayjs(candidate.testEndTime),
      "days"
    );
    setSelectedCandidate(obj);
    setOpen(true);
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
        render: (row: Candidate) => (
          <span
            className={`font-semibold ${row.result === "Pass" ? "text-green-600" : "text-red-600"}`}
          >
            {row.result}
          </span>
        ),
      },
      { key: "created", header: "Created" },
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
              <p className="text-lg font-semibold text-blue-500">
                {row?.details?.totalPercentage}
              </p>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                View Answer
              </a>
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
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {row?.details?.createdBy}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {row?.details?.createdOn}
            </p>
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
                {Object.keys(row?.details?.categories ?? {}).map((category) => (
                  <th
                    key={category}
                    className="border border-gray-300 px-4 py-2 text-left"
                  >
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  {row?.details?.totalPercentage}
                </td>
                {/* Dynamically render category percentages */}
                {Object.values(row?.details?.categories ?? {}).map(
                  (percentage, index) => (
                    <td
                      key={index}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {percentage as string}
                    </td>
                  )
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  };

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
      >
        {/* <Suspense fallback={<Loading />}> */}
        <div className="min-h-[500px]">
          <ReusableTable
            columns={columns}
            rows={currentItems}
            expandableRow={expandableRow}
            className="mb-6 animate-in fade-in duration-300"
            rowKey="id"
          />
        </div>
        {/* </Suspense> */}
      </Pagination>
      <DialogForm candidate={selectedCandidate} open={open} setOpen={setOpen} />
    </>
  );
}

export default CandidateTable;
