import React, { useState, memo } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Button } from "../ui/button";
import DateRangePicker from "./date-range-picker";

interface CandidateDetails {
  totalPercentage: string; // Total percentage scored
  mongodb: string; // MongoDB score
  expressJs: string; // Express.js score
  reactJs: string; // React.js score
  nodeJs: string; // Node.js score
  createdBy: string; // Name of the creator
  createdOn: string; // Creation date and time
}

interface Candidate {
  id: number; // Unique identifier
  date: string; // Date of assessment
  name: string; // Candidate's name
  email: string; // Candidate's email
  technology: string; // Technology stack (e.g., "MERN")
  experience: string; // Years of experience (e.g., "3+")
  assessment: string; // Assessment description
  result: string; // Result (e.g., "Pass")
  created: string; // Created by
  details: CandidateDetails; // Detailed assessment results
}

interface FiltersProps {
  candidates?: Candidate[]; // Array of Candidate objects
}

const Filters: React.FC<FiltersProps> = memo(({ candidates = [] }) => {
  const [activeFilter, setActiveFilter] = useState<string>("");

  const handleOpenFilter = (filterName: string): void => {
    setActiveFilter(activeFilter === filterName ? "" : filterName);
  };

  const renderFilterOptions = (filter: string) => {
    switch (filter) {
      case "candidates":
        return (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search candidates by name or ID"
              className="w-full"
            />
            <Select>
              <SelectTrigger className="w-full">
                Filter by status
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active Candidates</SelectItem>
                <SelectItem value="inactive">Inactive Candidates</SelectItem>
                <SelectItem value="archived">Archived Candidates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              className="w-full"
            />
            <Select>
              <SelectTrigger className="w-full">
                Filter by domain
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">@gmail.com</SelectItem>
                <SelectItem value="yahoo">@yahoo.com</SelectItem>
                <SelectItem value="company">@company.com</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "technology":
        return (
          <div className="space-y-4">
            <Select>
              <SelectTrigger className="w-full">
                Select technologies
              </SelectTrigger>
              <SelectContent>
                <Input
                  type="text"
                  placeholder="Search technologies"
                  className="mb-2"
                />
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="node">Node.js</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "exp.":
        return (
          <div className="space-y-4 w-64">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Min"
                className="w-20"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max"
                className="w-20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="text-sm">
                0–2 years
              </Button>
              <Button variant="outline" className="text-sm">
                3–5 years
              </Button>
              <Button variant="outline" className="text-sm">
                5+ years
              </Button>
            </div>
          </div>
        );

      case "assessment":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Min score"
                className="w-20"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max score"
                className="w-20"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full">
                Filter by status
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "created":
        return (
          <div className="space-y-2">
            <DateRangePicker />
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="text-sm ">
                Last 7 Days
              </Button>
              <Button variant="outline" className="text-sm">
                Last 30 Days
              </Button>
              <Button variant="outline" className="text-sm">
                Custom Range
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-6 mb-6 px-4">
      {/* Candidates Count */}

      {/* Dynamic Filter Buttons */}
      <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-4">
        <span className="text-base font-medium text-gray-800 dark:text-gray-200">
          Candidates{" "}
          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm font-semibold shadow">
            {candidates.length}
          </span>
        </span>
      </div>
        {["Candidates", "Email", "Technology", "Exp.", "Assessment", "Created"].map((filter) => (
          <div key={filter} className="relative">
            <Button
              variant="ghost"
              onClick={() => handleOpenFilter(filter.toLowerCase())}
              className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
            >
              {filter}
            </Button>
            {activeFilter === filter.toLowerCase() && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
                {renderFilterOptions(activeFilter)}
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="ghost" onClick={() => setActiveFilter("")}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      console.log(`Applied filter: ${activeFilter}`);
                      setActiveFilter("");
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4">
        {["Today", "Week"].map((timeFilter) => (
          <Button
            key={timeFilter}
            variant="ghost"
            onClick={() => handleOpenFilter(timeFilter.toLowerCase())}
            className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
          >
            {timeFilter}
          </Button>
        ))}
        <DateRangePicker />
      </div>
    </div>
  );
});

// Optional: Add a custom comparison function
Filters.displayName = "Filters"; // Add a display name for debugging
export default Filters;