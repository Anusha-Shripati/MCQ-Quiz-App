import React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import CandidateTable from '../../../components/candidates/candidate-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Metadata } from 'next';
const FiltersCandidates = dynamic(() => import('@/components/candidates/candidates-filters'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export const metadata: Metadata = {
  title: 'Candidates',
};

export default function Candidates() {
  return (
  <div className="px-2 py-6 flex flex-col h-full">
    <Card className="flex flex-col p-4 sm:p-6 gap-2">
        <FiltersCandidates />
        <CandidateTable />
      </Card>
    </div>
  );
}
