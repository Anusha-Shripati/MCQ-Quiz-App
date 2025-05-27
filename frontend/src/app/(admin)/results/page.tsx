import React from 'react';
import { Card } from '@/components/ui/card';
import ResultTable from '@/components/result/result-table';
import ResultFilter from '@/components/result/result-filters';


export default function Results() {
  return (
    <div className="p-4 sm:p-6 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 ">
          All Results
        </h1>
      </div>
      <Card className="flex flex-col p-4 sm:p-6 gap-2">
        <ResultFilter />
        <ResultTable />
      </Card>
    </div>
  );
}
