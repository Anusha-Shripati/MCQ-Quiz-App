'use client';

import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Define interfaces
export interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface ExpandableRow<T> {
  render: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  expandableRow?: ExpandableRow<T>;
  onRowClick?: (row: T) => void;
  className?: string;
  rowKey: keyof T;
  title?: string;
  isLoadingMore?: boolean;
  isEndReached?: boolean;
  intersectionObserverRef?: React.RefObject<HTMLDivElement>;
}

const ReusableTable = <T extends object>({
  columns,
  rows,
  expandableRow,
  onRowClick,
  className,
  title,
  isLoadingMore,
  isEndReached,
  intersectionObserverRef,
}: TableProps<T>) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Toggle expandable row
  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  console.log('rows', rows);
  return (
    <div className={`overflow-x-auto ${className} overflow-y-auto`}>
      <Table className="min-w-full animate-in fade-in duration-300">
        <TableHeader className="sticky z-10">
          <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800">
            {columns.map((column) => (
              <TableHead
                key={column.key.toString()}
                className={`sticky top-0 bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 ${column.className}`}
              >
                {column.header}
              </TableHead>
            ))}
            {/* Add a column for the expand/collapse icon if expandableRow is provided */}
            {expandableRow && (
              <TableHead className="sticky top-0 bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3"></TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + (expandableRow ? 1 : 0)}
                className="text-center py-4"
              >
                No data available
              </TableCell>
            </TableRow>
          )}

          {/* Render each row */}
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <TableRow
                title={title}
                onDoubleClick={() => {
                  onRowClick?.(row);
                }}
                // onClick={() => {
                //   onRowClick?.(row);
                // }}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {columns.map((column) => {
                  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
                    return path
                      .split('.')
                      .reduce<Record<
                        string,
                        unknown
                      > | null>((o, key) => (o && o[key] !== undefined ? (o[key] as Record<string, unknown>) : null), obj);
                  };

                  const value =
                    typeof column.key === 'string' && column.key.includes('.')
                      ? getNestedValue(row as Record<string, unknown>, column.key)
                      : row[column.key as keyof T];

                  return (
                    <TableCell key={column.key as string}>
                      {column.render ? column.render(row) : (value as React.ReactNode)}
                    </TableCell>
                  );
                })}
                {/* Add the expand/collapse icon if expandableRow is provided */}
                {expandableRow && (
                  <TableCell
                    onClick={() => {
                      toggleRow(rowIndex);
                    }}
                  >
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
                  <TableCell
                    colSpan={columns.length + (expandableRow ? 1 : 0)}
                    className="bg-gray-50 dark:bg-gray-700 p-4"
                  >
                    {expandableRow.render(row)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {intersectionObserverRef && <div ref={intersectionObserverRef}>
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {isEndReached && !isLoadingMore && (
          <div className="text-center py-4 text-sm text-gray-400">
            No more data available.
          </div>
        )}
      </div>}
    </div>
  );
};

export default ReusableTable;
