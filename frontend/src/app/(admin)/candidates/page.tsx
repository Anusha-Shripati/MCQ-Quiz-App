"use client";

import React, { Suspense, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FiCopy, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
const FiltersCandidates = dynamic(() => import("@/components/candidates/candidates-filters"), {
  suspense: true,
});
const ReusableTable = dynamic(() => import("@/components/candidates/candidates-table"), {
  suspense: true,
});


// Define types for Candidate and CandidateDetails
interface CandidateDetails {
  totalPercentage: string;
  mongodb: string;
  expressJs: string;
  reactJs: string;
  nodeJs: string;
  createdBy: string;
  createdOn: string;
}

interface ExpandableRow {
  render: (row: any) => React.ReactNode; // Function to render the expandable content
}

interface Column {
  key: string; // Unique key for the column
  header: string; // Display name for the column header
  render?: (row: any) => JSX.Element; // Optional function to render custom content for the column
}

interface Candidates {
  id: number;
  date: string;
  name: string;
  email: string;
  technology: string;
  experience: string;
  assessment: string;
  result: string;
  created: string;
  details: CandidateDetails;
}

export default function Candidates() {

  // Sample candidate data

  const candidates = useMemo(() =>
    [
      {
        id: 1,
        date: "18-19 Nov 2024",
        name: "Lary Page",
        email: "karan@mail...",
        technology: "MERN",
        experience: "3+",
        assessment: "MERN 3 years exp.",
        result: "Pass",
        created: "Mihirbhai",
        details: {
          totalPercentage: "90%",
          mongodb: "10%",
          expressJs: "10%",
          reactJs: "10%",
          nodeJs: "10%",
          createdBy: "Mihirbhai",
          createdOn: "17-Nov-2024 03:00PM",
        },
      },
      {
        id: 2,
        date: "18-19 Nov 2024",
        name: "Karan Doshi",
        email: "karan@mail...",
        technology: "MERN",
        experience: "3+",
        assessment: "MERN 3 years exp.",
        result: "Fail",
        created: "Mihirbhai",
        details: {
          totalPercentage: "60%",
          mongodb: "10%",
          expressJs: "10%",
          reactJs: "10%",
          nodeJs: "10%",
          createdBy: "Mihirbhai",
          createdOn: "17-Nov-2024 03:00PM",
        },
      },
    ]
    , [])

    const columns = useMemo(
      () => [
        { key: "date", header: "Date" },
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
      <div className="space-y-2">
        <p>
          <strong>Total Percentage:</strong> {row.details.totalPercentage}
        </p>
        <div className="flex gap-4">
          <p>
            <strong>MongoDB:</strong> {row.details.mongodb}
          </p>
          <p>
            <strong>Express Js:</strong> {row.details.expressJs}
          </p>
          <p>
            <strong>React Js:</strong> {row.details.reactJs}
          </p>
          <p>
            <strong>Node Js:</strong> {row.details.nodeJs}
          </p>
        </div>
        <p>
          <strong>Created By:</strong> {row.details.createdBy}
        </p>
        <p>
          <strong>Created On:</strong> {row.details.createdOn}
        </p>
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
        <Button
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 ease-in-out"
          aria-label="Add a new candidate"
        >
          Create Candidate
        </Button>
      </div>


      {/* Filters */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <FiltersCandidates candidates={candidates} />
      </Suspense>

      {/* Candidate info table */}
      <Suspense fallback={<div>Loading table...</div>}>
        <ReusableTable
          columns={columns}
          rows={candidates}
          expandableRow={expandableRow}
          className="mb-6"
          rowKey="id"
        />
      </Suspense>
    </div>
  );
}