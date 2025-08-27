'use client';
import DialogForm from '@/components/candidates/dialog-form';
import type { Column, ExpandableRow } from '@/components/common/reusable-table';
import ReusableTable from '@/components/common/reusable-table';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/form/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api, deleteData, isAxiosError } from '@/lib/api';
import { QUIZ_CONFIG } from '@/shared/constants/data';
import { useAuthStore } from '@/store/authStore';
import { useCandidateStore } from '@/store/candidateStore';
import type {
  AssessmentOption,
  CandidateFormData,
  ICandidate,
  TechnologyOption,
} from '@/types/candidate.types';
import { ExamMetaTech } from '@/types/exam.types';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCopy, FiMail } from 'react-icons/fi';
import useSWR, { mutate } from 'swr';
import StatusWrapper from '../common/status-wrapper';

function CandidateTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const searchParams = useSearchParams();
  const [selectedCandidate, setSelectedCandidate] = useState<null | CandidateFormData>(null);
  const [open, setOpen] = useState(false);
  const {
    candidateFilter,
    setCandidateFilter,
    setCandidateListData,
    candidateCount,
    candidateList,
    technologyOptions,
    assessmentOptions,
  } = useCandidateStore();
  const totalItems = candidateCount;
  const pathname = usePathname();
  const { hasPermissionCandidateEdit } = useAuthStore();
  const canEditCandidate = hasPermissionCandidateEdit();

  useEffect(() => {
    const params = new URLSearchParams();

    params.set('page', '1');
    params.set('perPage', itemsPerPage.toString());

    if (candidateFilter.searchQuery) {
      params.set('searchQuery', candidateFilter.searchQuery);
    }

    if (candidateFilter.technologyFilter.length > 0) {
      const techLabels = candidateFilter.technologyFilter.map((item) => item.label);
      params.set('technologyFilter', JSON.stringify(techLabels));
    }

    if (candidateFilter.assessmentFilter.length > 0) {
      const assessmentLabels = candidateFilter.assessmentFilter.map((item) => item.label);
      params.set('assessmentFilter', JSON.stringify(assessmentLabels));
    }

    if (candidateFilter.created) {
      params.set('created', JSON.stringify(candidateFilter.created));
    }

    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }, [currentPage, itemsPerPage, candidateFilter, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get('page')) setCurrentPage(Number(params.get('page')));
    if (params.get('perPage')) setItemsPerPage(Number(params.get('perPage')));
    const filterParams = {
      searchQuery: params.get('searchQuery') || '',
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
      created: params.get('created') ? JSON.parse(params.get('created') as string) : {},
    };
    setCandidateFilter(filterParams);
  }, [searchParams, technologyOptions, assessmentOptions]);

  const queryObj = useMemo(
    () => ({
      page: currentPage || 1,
      limit: itemsPerPage || 10,
      // ...candidateFilter,
      search: candidateFilter.searchQuery,
      technologyFilter: candidateFilter.technologyFilter.map(
        (item: TechnologyOption) => item.value
      ),
      assessmentFilter: candidateFilter.assessmentFilter.map(
        (item: AssessmentOption) => item.value
      ),
      created: JSON.stringify({
        range: candidateFilter.created?.range ? candidateFilter.created?.range : undefined,
      }),
    }),
    [currentPage, itemsPerPage, candidateFilter]
  );

  const cleanedQuery = useMemo(
    () =>
      qs.stringify(queryObj, {
        skipNull: true,
        skipEmptyString: true,
      }),
    [queryObj]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: candidateData,
    error,
    isLoading,
  } = useSWR(`/candidate/list?${cleanedQuery}`, api.get);

  useEffect(() => {
    if (candidateData?.data?.list) {
      setCandidateListData(candidateData?.data?.total, candidateData?.data?.list);
    }
  }, [candidateData, setCandidateListData]);
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

  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    return candidateList;
  }, [candidateList]);

  const formatTestDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in hours
    const duration = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return `${duration.toFixed(2)} hours`; // e.g., "3 hours"
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await deleteData(`/candidate/${id}`);
        if (res.success) {
          toast.success('Candidate deleted successfully');
        }
        await mutate((key) => typeof key === 'string' && key.startsWith('/candidate/list'));
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response.data.message || 'An unexpected error occurred');
        } else {
          toast.error('An unexpected error occurred');
        }
      }
    }
  };

  const formatTestDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startTime = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${startTime}–${endTime}`; // e.g., "09:00 AM–12:00 PM"
  };
  const handleEdit = (candidate: ICandidate) => {
    const obj: CandidateFormData = {
      ...candidate,
      assessment: candidate.assessment?.id as string,
      technology: candidate.assessment?.technologies
        ? (candidate.assessment?.technologies
            .map((item) => item?.technology?.name)
            .join(', ') as string)
        : '',
      startDate: new Date(candidate.exam?.start_time as string),
      endDate: new Date(candidate.exam?.end_time as string),
      timeUnit: 'days',
      timeValue: dayjs(candidate.exam?.end_time as string).diff(
        dayjs(candidate.exam?.start_time as string),
        'days'
      ),
    };

    setSelectedCandidate(obj);
    setOpen(true);
  };

  const columns = useMemo<Array<Column<ICandidate>>>(
    () => [
      {
        key: 'exam.start_time',
        header: 'Test Date',
        render: (row) =>
          row.exam?.start_time ? (
            <span className="text-sm">
              {format(new Date(row.exam.start_time), 'MMM dd, yyyy hh:mm a')}
            </span>
          ) : (
            <span className="text-sm">-</span>
          ),
      },
      { key: 'name', header: 'Name' },
      {
        key: 'email',
        header: 'Email',
        render: (row) => {
          const email = row?.email || '';
          const [localPart, domain] = email.split('@');

          if (!localPart || !domain) return '-';

          const visiblePart = localPart.slice(0, 5);
          return (
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm">
                  {visiblePart}...@{domain}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {email}
              </TooltipContent>
            </Tooltip>
          );
        },
      },

      {
        key: 'technology',
        header: 'Technology',
        render: (row) => {
          const totalTechnologies = row.assessment?.technologies?.length || 0;
          const displayTechnologies = row.assessment?.technologies?.slice(0, 2) || [];
          const remainingCount = totalTechnologies > 2 ? ` +${totalTechnologies - 2}` : '';

          const allTechnologies = row.assessment?.technologies
            ?.map((item) => item?.technology?.name)
            .filter(Boolean)
            .join(', ');

          return totalTechnologies > 0 ? (
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm">
                  {displayTechnologies.map((tech, index) => (
                    <span key={index} className="mr-1">
                      {tech?.technology?.name}
                    </span>
                  ))}
                  {remainingCount}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {allTechnologies || 'No technologies available'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-sm">-</span>
          );
        },
      },
      { key: 'experience', header: 'Exp.' },
      { key: 'assessment.name', header: 'Assessment' },
      // {
      //   key: "results",
      //   header: "Result",
      //   render: (row) => (
      //     <span
      //       className={`font-semibold ${row.results === "Pass" ? "text-green-600" : "text-red-600"}`}
      //     >
      //       {row.results}
      //     </span>
      //   ),
      // },
      {
        key: 'created_at',
        header: 'Created',
        render: (row) => (
          <span className="text-sm">
            {format(new Date(row.created_at), 'MMM dd, yyyy hh:mm a')}
          </span>
        ),
      },
      {
        key: 'created_by_user.name',
        header: 'Created By',
        render: (row) => (
          <span className="text-sm">
            {row.created_by_user?.name}{' '}
            {row.created_by_user?.deleted_at ? (
              <span className="text-red-500"> (Deleted)</span>
            ) : (
              ''
            )}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => {
          const statusMap = {
            completed: 'bg-green-100 text-green-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            pending: 'bg-gray-100 text-gray-800',
            expired: 'bg-red-100 text-red-800',
          };

          const status = row.exam?.status as 'completed' | 'in_progress' | 'pending' | 'expired';
          const badgeClass = statusMap[status] || 'bg-gray-100 text-gray-800';

          return (
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-md ${badgeClass} text-center min-w-[100px]`}
                  style={{ minWidth: 100, display: 'inline-block' }}
                >
                  <div>{status?.replace('_', ' ') || 'Unknown'}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {row?.result?.length
                  ? `(${row?.result[0]?.percentage?.toFixed(2)}) %`
                  : 'Exam not started'}
              </TooltipContent>
            </Tooltip>
          );
        },
      },

      {
        key: 'actions',
        header: 'Share',
        render: (candidate: ICandidate) => (
          <div className="flex items-center gap-2">
            {candidate.exam?.status !== 'completed' && candidate.exam?.status !== 'expired' && (
              <Button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    navigator.clipboard.writeText(candidate.meta.examLink as string);
                    const expiresAt = new Date(candidate.meta.tokenExpiresAt as string);
                    const formattedExpiration = expiresAt.toLocaleString();

                    toast.success(`Exam link copied! Valid until ${formattedExpiration}`);
                  } catch (error) {
                    console.error('Error getting exam link:', error);
                    toast.error('Failed to get exam link');
                  }
                }}
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Copy exam access link"
              >
                <FiCopy className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
            )}
            {/* <Button
              onClick={async() => {
                await api.get('/candidate/reset-all/'+candidate.id)  
                window.location.reload()  
              }}
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              Reset All
            </Button> */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                  window.location.href = `mailto:${candidate.email}`;
              }}
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <FiMail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
            {candidate.exam?.status === 'pending' && canEditCandidate &&  (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(candidate);
                  }}
                  variant="ghost"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(candidate.id as string);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [canEditCandidate]
  );
  const getTechnology = (id: string) => {
    const technology = technologyOptions.find((item) => item.value == id);
    if (technology) return technology.label;
    return '-';
  };

  const expandableRow: ExpandableRow<ICandidate> = {
    render: (row: ICandidate) => (
      <div className="border border-gray-200  p-4 space-y-6 rounded-lg transition-all duration-300 ease-in-out transform origin-top animate-in fade-in zoom-in-95">
        {/* Row Layout */}
        <div className="flex items-center justify-between">
          {/* Result Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Result</p>
            <div className="flex gap-2 flex-col">
              {row.result.length > 0 && (
                <p className="text-lg font-semibold text-blue-500">
                  {row?.result?.length ? row?.result[0]?.percentage?.toFixed(2) : '-'} %
                </p>
              )}
              {row.result.length > 0 && (
                <Link
                  href={`/results/${row.result[0]?.id}`}
                  target="_blank"
                  className="text-sm text-blue-500 hover:underline"
                >
                  View Answer
                </Link>
              )}
            </div>
          </div>

          {/* Test Time Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Test Time</p>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {formatTestDuration(
                    row?.exam?.start_time as string,
                    row?.exam?.end_time as string
                  )}
                  {Array.isArray(row?.exam?.meta?.violations) &&
                    row.exam.meta.violations.length > QUIZ_CONFIG.maxViolations && (
                      <span className="ml-2 text-red-600 font-semibold text-sm">
                        (Maximum violations detected)
                      </span>
                    )}
                </p>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white p-2 rounded shadow-lg">
                {formatTestDateRange(
                  row?.exam?.start_time as string,
                  row?.exam?.end_time as string
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Created Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Created</p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {row?.exam?.user?.name}{' '}
              {row?.exam?.user?.deleted_at ? <span className="text-red-500"> (Deleted)</span> : ''}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {row?.created_at ? dayjs(row?.created_at).format('DD/MM/YYYY h:mm A') : '-'}
            </p>
          </div>
        </div>

        {/* Detailed Table */}
        <div>
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead className="dark:text-gray-800">
              <tr className="dark:bg-gray-500 dark:text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">Total Percentage</th>
                {/* Dynamically render category headers */}
                {row?.exam?.meta?.tech_score?.map((technology: ExamMetaTech) => (
                  <th
                    key={technology.technology_id}
                    className="border border-gray-300 px-4 py-2 text-left"
                  >
                    {getTechnology(technology.technology_id)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">
                  {row?.result?.length ? row?.result[0]?.percentage?.toFixed(2) : '-'} %
                  <small>
                    {' '}
                    (&nbsp;
                    {row?.result?.length ? row?.result[0]?.score?.toFixed(1) : '-'} /&nbsp;
                    {row?.result?.length ? row?.result[0]?.total : '-'}
                    &nbsp;){' '}
                  </small>
                </td>
                {/* Dynamically render category percentages */}
                {row?.exam?.meta?.tech_score?.map((technology: ExamMetaTech) => (
                  <th
                    key={technology.technology_id}
                    className="border border-gray-300 px-4 py-2 text-left"
                  >
                    {technology.percentage?.toFixed(2)} %
                    <small>
                      {' '}
                      (&nbsp;
                      {technology.score.toFixed(1)} / {technology.total}
                      &nbsp;){' '}
                    </small>
                  </th>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  };

  return (
    <StatusWrapper loading={isLoading} className="min-h-[74vh]" error={error}>
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
        <div className="min-h-[500px]">
          <ReusableTable
            columns={columns}
            rows={currentItems}
            expandableRow={expandableRow}
            className="mb-6 h-[65vh] animate-in fade-in duration-300"
            rowKey="id"
          />
        </div>
      </Pagination>
      <DialogForm candidate={selectedCandidate} open={open} setOpen={setOpen} />
    </StatusWrapper>
  );
}

export default CandidateTable;
