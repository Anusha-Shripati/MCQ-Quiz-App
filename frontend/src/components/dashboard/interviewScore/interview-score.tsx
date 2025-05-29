'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import LanguageScoreSelect from './filter';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { api } from '@/lib/api';
import useSWR from 'swr';
import ReusableTable from '../../common/reusable-table';
import StatusWrapper from '@/components/common/status-wrapper';
import Pagination from '@/components/pagination';


interface ScoreData {
  date: string;
  name: string;
  score: string;
}

function InterviewScore() {
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [filters, setFilters] = useState<{ language: string, min: null | number, max: null | number }>({ language: '', min: null, max: null });
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [total, setTotal] = useState(0)


  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.language) params.set('language', filters.language);
    if (filters.min !== null) params.set('min', String(filters.min));
    if (filters.max !== null) params.set('max', String(filters.max));
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return `/dashboard/get-interview-score?${params.toString()}`;
  }, [filters, page, limit]);

  const { data, isLoading, error,mutate,isValidating } = useSWR(
    query,
    api.get
  );

  useEffect(() => {
    if (data) {
      setScoreData(data.data?.list || []);
      setTotal(data.data?.total || 0)
    }
  }, [data]);
  const handleSetFilter = (name: string, value: string) => {
    setFilters((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const columns = [
    { key: 'date', header: 'Date', render: (row: ScoreData) => row.date },
    {
      key: 'name',
      header: 'Name',
      render: (row: ScoreData) => (
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{row.name}</AvatarFallback>
          </Avatar>
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      render: (row: ScoreData) => (
        <div className="flex items-center space-x-2">
          <Progress value={parseInt(row.score)} className="w-32 " />
          <span>{row.score}</span>
        </div>
      ),
    },

  ];

  return (
    <Card className="col-span-12 md:col-span-6 row-span-2">
      <StatusWrapper loading={isLoading || isValidating} reset={mutate} error={error} className='w-full h-full flex flex-col'>
        <CardHeader>
          <div className="flex items-center justify-between space-x-1">
            <div className="space-y-1">
              <CardTitle>Interview Scores</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Performance of candidates.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageScoreSelect setFilters={handleSetFilter} filters={filters} />
            </div>
          </div>
        </CardHeader>
        <CardContent className='h-full flex-grow'>
          <Pagination
            currentPage={page}
            currentPageEnd={((page - 1) * limit) + limit}
            currentPageStart={((page - 1) * limit) + 1 }
            onPageChange={(e) => setPage(e)}
            totalItems={total}
            onPerPageChange={(e) => setLimit(Number(e))}
            itemsPerPage={limit}
            className='h-full'
          >
            <ReusableTable columns={columns} rows={scoreData} rowKey="name" className='max-h-[500px]' />
          </Pagination>
        </CardContent>
      </StatusWrapper>
    </Card>

  );
}

export default InterviewScore;
