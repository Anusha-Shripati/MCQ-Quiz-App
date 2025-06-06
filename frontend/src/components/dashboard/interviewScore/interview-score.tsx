'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../../ui/card';
import LanguageScoreSelect from './filter';
import { Progress } from '../../ui/progress';
import { api } from '@/lib/api';
import useSWRInfinite from 'swr/infinite';
import ReusableTable from '../../common/reusable-table';
import StatusWrapper from '@/components/common/status-wrapper';
import { useRouter } from 'next/navigation';
import { RESULTS_TITLE } from '@/shared/constants/data';


interface ScoreData {
  id: string;
  date: string;
  name: string;
  score: string;
}

interface InterviewScoreResponse {
  data: {
    limit: number;
    page: number;
    list: ScoreData[];
    total: number;
  };
  message: string;
  status: number;
  success: boolean;
}

function InterviewScore() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ language: string; min: number | null; max: number | null }>({
    language: '',
    min: null,
    max: null,
  });
  const PAGE_SIZE = 5;

  const getKey = (pageIndex: number, previousPageData: InterviewScoreResponse) => {
    console.log('Fetching page:', previousPageData);
    if (previousPageData && !previousPageData.data?.list?.length) return null;
    const params = new URLSearchParams();
    if (filters.language) params.set('language', filters.language);
    if (filters.min !== null) params.set('min', String(filters.min));
    if (filters.max !== null) params.set('max', String(filters.max));
    params.set('page', String(pageIndex + 1));
    params.set('limit', String(PAGE_SIZE));
    return `/dashboard/get-interview-score?${params.toString()}`;
  };

  const {
    data,
    error,
    isLoading,
    size,
    setSize,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey, api.get, {
    revalidateFirstPage: false,
  });

  const observerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMore = isValidating && size > 0;

  const flatData = useMemo(
    () => data?.flatMap((page) => page.data?.list || []) ?? [],
    [data]
  );

  const isEndReached = useMemo(() => {
    const lastPage = data?.[data.length - 1];
    if (!lastPage) return false;

    const total = lastPage.data?.total || 0;
    const loadedPages = size;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return loadedPages >= totalPages;
  }, [data, size]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isEndReached && !isLoadingMore) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }

    );
    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [isEndReached, isLoadingMore, setSize]);

  const handleSetFilter = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNavigation = (row: ScoreData) => {
    router.push(`/results/${row.id}`);
  }

  const columns = [
    { key: 'date', header: 'Date', render: (row: ScoreData) => row.date },
    {
      key: 'name',
      header: 'Name',
      render: (row: ScoreData) => (
        <div className="flex items-center space-x-2">
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
      <CardHeader>
        <div className="flex items-center justify-between space-x-1">
          <div className="space-y-1">
            <CardTitle>Interview Scores</CardTitle>
            <CardDescription className="text-xs text-gray-600">
              Performance of candidates.
            </CardDescription>
          </div>
          <LanguageScoreSelect setFilters={handleSetFilter} filters={filters} />
        </div>
      </CardHeader>
      <StatusWrapper loading={isLoading} reset={mutate} error={error} className="w-full h-full flex flex-col">
        <CardContent className="h-full flex-grow">
          <ReusableTable
            columns={columns}
            rows={flatData}
            onRowClick={handleNavigation}
            title={RESULTS_TITLE}
            rowKey="id"
            className="max-h-[500px]"
            isEndReached={isEndReached}
            intersectionObserverRef={observerRef}
            isLoadingMore={isLoadingMore}
          />
        </CardContent>
      </StatusWrapper>
    </Card>
  );
}

export default InterviewScore;
