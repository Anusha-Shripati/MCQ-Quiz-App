'use client';

import React from 'react';

export interface PlatformColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

export interface PlatformTableProps<T> {
  columns: PlatformColumn<T>[];
  data: T[];
  rowKey: keyof T;
  emptyMessage?: string;
}

export default function PlatformTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No data found',
}: PlatformTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="h-12 px-4 text-left align-middle font-medium text-slate-900 dark:text-white"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[rowKey])}
                className="hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
