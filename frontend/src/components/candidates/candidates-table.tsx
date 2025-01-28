"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react"; // Add expand/collapse icons

// Define interfaces
interface Column {
  key: string;
  header: string;
  className?: string;
  render?: (row: any) => React.ReactNode; // Custom render function for cells
}

interface ExpandableRow {
  render: (row: any) => React.ReactNode; // Function to render the expandable content
}

interface TableProps {
  columns: Column[];
  rows: any[];
  expandableRow?: ExpandableRow; // Optional expandable row configuration
  onRowClick?: (row: any) => void; // Optional row click handler
  className?: string; // Optional className for the table container
  rowKey:string
}

const ReusableTable: React.FC<TableProps> = ({
  columns,
  rows,
  expandableRow,
  onRowClick,
  className,
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Toggle expandable row
  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto ${className} h-[600px] overflow-y-scroll`}>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`sticky top-0 bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 ${column.className}`}
              >
                {column.header}
              </TableHead>
            ))}
            {/* Add a column for the expand/collapse icon if expandableRow is provided */}
            {expandableRow && (
              <TableHead className="sticky top-0 bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3">
               
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <TableRow
                onClick={() => {
                  onRowClick?.(row);
                  toggleRow(rowIndex);
                }}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
                {/* Add the expand/collapse icon if expandableRow is provided */}
                {expandableRow && (
                  <TableCell>
                    {expandedRow === rowIndex ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </TableCell>
                )}
              </TableRow>
              {/* Render expandable content if expandableRow is provided and the row is expanded */}
              {expandableRow && expandedRow === rowIndex && ( 
                <TableRow>
                  <TableCell colSpan={columns.length + (expandableRow ? 1 : 0)} className="bg-gray-50 dark:bg-gray-700 p-4">
                    {expandableRow.render(row)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReusableTable;