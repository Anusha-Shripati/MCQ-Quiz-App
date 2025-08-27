'use client';
import type { Column, ExpandableRow } from '@/components/common/reusable-table';
import ReusableTable from '@/components/common/reusable-table';
import Pagination from '@/components/pagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { StatusOption } from '@/types/common.types';
import { Result } from '@/types/exam.types';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { ArrowRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import StatusWrapper from '../common/status-wrapper';
import Link from 'next/link';
import { useResultStore } from '@/store/resultStore';
import { resultEndpoint } from '@/lib/endpoint';
import ResultExpandableRow from './result-expandable-row';

function ResultTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const {
    resultFilter,
    setResultFilter,
    setResultListData,
    resultCount,
    resultList,
    technologyOptions,
    assessmentOptions,
  } = useResultStore();

  const totalItems = resultCount;
  const pathname = usePathname();
  
  useEffect(() => {
    const params = new URLSearchParams();

    params.set('page', '1');
    params.set('perPage', itemsPerPage.toString());

    if (resultFilter.technologyFilter.length > 0) {
      const techLabels = resultFilter.technologyFilter.map((item) => item.label);
      params.set('technologyFilter', JSON.stringify(techLabels));
    }

    if (resultFilter.assessmentFilter.length > 0) {
      const assessmentLabels = resultFilter.assessmentFilter.map((item) => item.label);
      params.set('assessmentFilter', JSON.stringify(assessmentLabels));
    }

    if (resultFilter.search) params.set('search', resultFilter.search)
    if (resultFilter.startDate) params.set('startDate', JSON.stringify(resultFilter.startDate));
    if (resultFilter.endDate) params.set('endDate', JSON.stringify(resultFilter.endDate));
    if (resultFilter.days) params.set('days', JSON.stringify(resultFilter.days));
    if (resultFilter.percentageFrom) params.set('percentageFrom', JSON.stringify(resultFilter.percentageFrom));
    if (resultFilter.percentageTo) params.set('percentageTo', JSON.stringify(resultFilter.percentageTo));
    if (resultFilter.experienceTo) params.set('experienceTo', JSON.stringify(resultFilter.experienceTo));
    if (resultFilter.experienceFrom) params.set('experienceFrom', JSON.stringify(resultFilter.experienceFrom));

    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }, [currentPage, itemsPerPage, resultFilter, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get('page')) setCurrentPage(Number(params.get('page')));
    if (params.get('perPage')) setItemsPerPage(Number(params.get('perPage')));
    const filterParams = {
      search: params.get('search') || '',
      technologyFilter: params.get('technologyFilter')
        ? JSON.parse(params.get('technologyFilter') as string).map((label: string) => {
          const found = technologyOptions.find((opt) => opt.label === label);
          return found || { value: '', label };
        })
        : [],
      assessmentFilter: params.get('assessmentFilter')
        ? JSON.parse(params.get('assessmentFilter') as string).map((label: string) => {
          const found = assessmentOptions.find((opt) => opt.label === label);
          return found || { value: '', label };
        })
        : [],
      startDate: params.get('startDate') ? JSON.parse(params.get('startDate') as string) : '',
      endDate: params.get('endDate') ? JSON.parse(params.get('endDate') as string) : '',
      percentageFrom: params.get('percentageFrom') ? Number(JSON.parse(params.get('percentageFrom') as string)) : null,
      percentageTo: params.get('percentageTo') ? Number(JSON.parse(params.get('percentageTo') as string)) : null,
      experienceFrom: params.get('experienceFrom') ? Number(JSON.parse(params.get('experienceFrom') as string)) : null,
      experienceTo: params.get('experienceTo') ? Number(JSON.parse(params.get('experienceTo') as string)) : null,
      days: params.get('days') ? JSON.parse(params.get('days') as string) : '',
    };
    setResultFilter(filterParams);
  }, [searchParams, technologyOptions, assessmentOptions]);

  const queryObj = useMemo(
    () => ({
      page: currentPage || 1,
      limit: itemsPerPage || 10,
      search: resultFilter.search,
      technology_ids: resultFilter.technologyFilter.map(
        (item: StatusOption) => item.value
      ),
      assessment_ids: resultFilter.assessmentFilter.map(
        (item: StatusOption) => item.value
      ),
      ...(resultFilter.startDate && { startDate: dayjs(resultFilter.startDate).toISOString() }),
      ...(resultFilter.endDate && { endDate: dayjs(resultFilter.endDate).toISOString() }),
      ...(resultFilter.percentageFrom && { percentageFrom: resultFilter.percentageFrom }),
      ...(resultFilter.percentageTo && { percentageTo: resultFilter.percentageTo }),
      ...(resultFilter.experienceFrom && { experienceFrom: resultFilter.experienceFrom }),
      ...(resultFilter.experienceTo && { experienceTo: resultFilter.experienceTo }),
    }),
    [currentPage, itemsPerPage, resultFilter]
  );

  const cleanedQuery = useMemo(
    () =>
      qs.stringify(queryObj, {
        skipNull: true,
        skipEmptyString: true,
      }),
    [queryObj]
  );

  const {
    data: candidateData,
    error,
    isLoading,
    isValidating,
    mutate
  } = useSWR(`${resultEndpoint.LIST}?${cleanedQuery}`, api.get);

  useEffect(() => {
    if (candidateData?.data?.list) {
      setResultListData(candidateData?.data?.total, candidateData?.data?.list);
    }
  }, [candidateData, setResultListData]);

  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page.toString() });
  };

  const updateQueryParams = (params: { page?: string; perPage?: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (params.page) newParams.set('page', params.page);
    if (params.perPage) newParams.set('perPage', params.perPage);
    window.history.pushState(null, '', `${pathname}?${newParams.toString()}`);
  };

  const handleRowClick = (result: Result) => {

    setExpandedRowId(expandedRowId === Number(result.id) ? null : Number(result.id));
  };

  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    return resultList;
  }, [resultList]);

  const columns = useMemo<Array<Column<Result>>>(
    () => [
      {
        key: 'exam.start_time',
        header: 'Test Date',
        render: (row) =>
          row.exam?.start_time
            ? format(new Date(row.exam.start_time), 'MMM dd, yyyy hh:mm a')
            : '-',
      },
      { key: 'name', header: 'Name', render: (row) => row.exam?.candidate?.name || '-' },
      { key: 'email', header: 'Email', render: (row) => row.exam?.candidate?.email || '-', },
      {
        key: 'technology',
        header: 'Technology',
        render: (row) => {
          const technologies = row?.exam?.assessment?.technologies || [];
          const totalTechnologies = technologies.length;
          const displayTechnologies = technologies.slice(0, 2).map(item => item?.technology?.name).filter(Boolean);
          const remainingCount = totalTechnologies > 2 ? ` +${totalTechnologies - 2}` : '';

          const allTechnologies = technologies.map(item => item?.technology?.name).filter(Boolean).join(', ');

          return totalTechnologies > 0 ? (
            <Tooltip>
              <TooltipTrigger>
                <span>
                  {displayTechnologies.join(', ')}{remainingCount}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                <p>{allTechnologies}</p>
              </TooltipContent>
            </Tooltip>
          ) : '-';
        },
      },
      { key: 'experience', header: 'Exp. (Year)', render: (row) => row.exam?.candidate?.experience || '-' },
      { key: 'assessment.name', header: 'Assessment', render: (row) => row.exam?.assessment?.name || '-' },
      {
        key: 'created_at',
        header: 'Created At',
        render: (row) => format(new Date(row.exam?.created_at), 'MMM dd, yyyy hh:mm a'),
      },
      {
        key: 'percentage',
        header: 'Result',
        render: (row) => {
          const statusMap = {
            pass: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
          };

          const badgeClass = row?.is_passed ? statusMap.pass : statusMap.failed;

          return (
            <Tooltip>
              <TooltipTrigger>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${badgeClass} `}>
                  {row?.percentage?.toFixed(2)} % ({row?.is_passed ? 'Pass' : 'Failed'})
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                <p className='font-semibold'>Passing Criteria:</p>
                <p>{row?.pass_criteria} %</p>
              </TooltipContent>
            </Tooltip>
          );
        }
      },
      {
        key: 'actions',
        header: '',
        render: (result: Result) => (
          <Link
            href={`/results/${result.id}`}
            className="p-2 rounded-lg transition-all duration-200"
            target='_blank'
            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the arrow
          >
            <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Link>
        ),
      },
    ],
    []
  );

  const expandableRow: ExpandableRow<Result> = {
    render: (row: Result) => <ResultExpandableRow row={row} technologyOptions={technologyOptions} />
  };

  return (
    <StatusWrapper loading={isLoading || isValidating } reset={mutate} className="min-h-[68vh] flex" error={error}>
      <Pagination
        className="flex-grow"
        currentPageStart={currentPageStart}
        currentPageEnd={currentPageEnd}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPerPageChange={handlePerPageChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >
          <div className="h-[60vh]">
          <ReusableTable
            columns={columns}
            rows={currentItems}
            expandableRow={expandableRow}
            className="h-[60vh] animate-in fade-in duration-300"
            rowKey="id"
            onRowClick={handleRowClick}
          />
        </div>
      </Pagination>
    </StatusWrapper>

  );
}

export default ResultTable;
