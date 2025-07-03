import React from 'react';
import { Card } from '@/components/ui/card';
import ResultTable from '@/components/result/result-table';
import ResultFilter from '@/components/result/result-filters';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Results',
};

export default function Results() {
  return (
    <div className="px-2 py-6 flex flex-col">
      <Card className="flex flex-col p-4 sm:p-6 gap-2">
          <ResultFilter />
        <ResultTable />
      </Card>
    </div>
  );
}
