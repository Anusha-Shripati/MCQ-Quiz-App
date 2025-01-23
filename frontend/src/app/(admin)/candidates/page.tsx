"use client";

import React, { Suspense, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
import { FiCopy, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import CreateCandidateDialog from "@/components/candidates/create-candidate-dialog";
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

// interface Column {
//   key: string; // Unique key for the column
//   header: string; // Display name for the column header
//   render?: (row: any) => JSX.Element; // Optional function to render custom content for the column
// }

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

  const [ openCreateCandidate, setOpenCreateCandidate ] = useState(false);

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
      <div className="border border-gray-200 rounded-lg p-4 space-y-6">
      {/* Row Layout */}
      <div className="flex items-center justify-between">
        {/* Result Section */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">Result</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-blue-500">70%</p>
            <a href="#" className="text-sm text-blue-500 hover:underline">View Answer</a>
          </div>
        </div>
    
        {/* Test Time Section */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">Test Time</p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">18-Nov-2024 03:00PM–6:00PM</p>
        </div>
    
        {/* Created Section */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">Created</p>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Mihirbhai</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">17-Nov-2024 03:00PM</p>
        </div>
      </div>
    
      {/* Detailed Table */}
      <div>
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead className="dark:text-gray-800">
            <tr className="dark:bg-gray-500 dark:text-white">
              <th className="border border-gray-300 px-4 py-2 text-left">Total Percentage</th>
              <th className="border border-gray-300 px-4 py-2 text-left">MongoDB</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Express Js</th>
              <th className="border border-gray-300 px-4 py-2 text-left">React Js</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Node Js</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{row.details.totalPercentage}</td>
              <td className="border border-gray-300 px-4 py-2">{row.details.mongodb}</td>
              <td className="border border-gray-300 px-4 py-2">{row.details.expressJs}</td>
              <td className="border border-gray-300 px-4 py-2">{row.details.reactJs}</td>
              <td className="border border-gray-300 px-4 py-2">{row.details.nodeJs}</td>
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