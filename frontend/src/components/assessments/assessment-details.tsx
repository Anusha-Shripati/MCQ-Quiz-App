'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import AssessmentEdit from './assessment-edit';
import { toast } from 'react-hot-toast';
import { Assessment, AssessmentFilters, Technology, useAssessmentStore } from '@/store/assessmentStore';
// import { LoadingSpinner } from "../ui/loading-spinner";
import useSWR, { mutate } from 'swr';
import Pagination from '../pagination';
import { api, deleteData, isAxiosError } from '@/lib/api';
import qs from 'query-string';
import dayjs from 'dayjs';
import { usePathname, useSearchParams } from 'next/navigation';
import StatusWrapper from '../common/status-wrapper';
import { assessmentEndpoint } from '@/lib/endpoint';
import { DeleteDialog } from '../common/delete-dialog';
// import StatusWrapper from "../common/status-wrapper";

interface AssessmentItemProps {
  key: string;
  assessmentId: string;
  title: string;
  createdBy: string;
  createdDate: string;
  duration: string | number;
  technologies?: Technology[];
  isExpanded: boolean;
  onToggle: () => void;
  handleEdit: () => void;
  handleDelete: (id: string) => void;
  pass_criteria?: number;
}

function AssessmentItem({
  assessmentId,
  title,
  createdBy,
  createdDate,
  duration,
  technologies,
  isExpanded,
  pass_criteria,
  onToggle,
  handleEdit,
  handleDelete,
}: AssessmentItemProps) {
  const initial = { easy: 0, medium: 0, hard: 0 };
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false)

  const totalQuestions =
    technologies?.reduce(
      (total, tech) => ({
        easy: total.easy + tech.easy,
        medium: total.medium + tech.medium,
        hard: total.hard + tech.hard,
      }),
      initial
    ) || initial;

  const total =
    (totalQuestions?.easy || 0) + (totalQuestions?.medium || 0) + (totalQuestions?.hard || 0);

  const getPercentage = (count: number) => {
    if (!total) return '0.00%';
    return `${Math.round((count / total) * 100)}%`;
  };

  const calculateTechPer = useCallback(
    (technology: Technology) => {
      const totalTech =
        (technology?.easy || 0) + (technology?.medium || 0) + (technology?.hard || 0);
      if (!totalTech) return '0.00%';
      return `${Math.round((totalTech / total) * 100)}%`;
    },
    [assessmentId]
  );
  const onDelete = (assessmentId: string) => {
    setDeleteId(assessmentId)
    setDeleteOpen(true)
  }
  return (
    <div className="border-b">
      <DeleteDialog onDelete={() => handleDelete(deleteId as string)} setOpen={setDeleteOpen} isOpen={deleteOpen} />
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Created by{' '}
            <span className="text-gray-700 font-medium dark:text-gray-300">{createdBy}</span> on{' '}
            <span className="text-gray-700 font-medium dark:text-gray-300">
              {dayjs(createdDate).format('DD MMM YYYY h:m A')}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Duration:{' '}
            <span className="text-gray-700 font-medium dark:text-gray-300">{duration} minutes</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(assessmentId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && technologies && (
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium text-gray-700 dark:text-gray-300">Technology</div>
              <div className="text-center font-medium text-gray-700 bg-green-100 rounded-full px-2 py-1">
                Easy ({getPercentage(totalQuestions.easy)})
              </div>
              <div className="text-center font-medium text-gray-700 bg-blue-100 rounded-full px-2 py-1">
                Medium ({getPercentage(totalQuestions.medium)})
              </div>
              <div className="text-center font-medium text-gray-700 bg-red-100 rounded-full px-2 py-1">
                Hard ({getPercentage(totalQuestions.hard)})
              </div>
              <div className="font-medium text-gray-700 dark:text-gray-300 text-right">
                Total Questions
              </div>
            </div>
            {technologies.map((tech) => (
              <div key={tech.id} className="grid grid-cols-5 gap-4 py-2">
                <div className="text-gray-900 dark:text-gray-300 font-medium">
                  {tech?.technology?.name}{' '}
                  <span className="text-gray-500">({calculateTechPer(tech)})</span>
                </div>
                <div className="text-center text-gray-800 dark:text-gray-300">{tech.easy}</div>
                <div className="text-center text-gray-800 dark:text-gray-300">{tech.medium}</div>
                <div className="text-center text-gray-800 dark:text-gray-300">{tech.hard}</div>
                <div className="text-center text-gray-800 dark:text-gray-300 font-semibold">
                  {tech.easy + tech.medium + tech.hard}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-5 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-gray-300">Total</div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">
                {totalQuestions?.easy}
              </div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">
                {totalQuestions?.medium}
              </div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">
                {totalQuestions?.hard}
              </div>
              <div className="text-center font-semibold text-blue-600">{total}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentDetails() {
  const [expandedId, setExpandedId] = useState<string>('mern');
  const [editing, setEditing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPageStart, setCurrentPageStart] = useState<number>(1);
  const [currentPageEnd, setCurrentPageEnd] = useState<number>(1);
  const [assessments, setAssessments] = useState<Required<Assessment>[]>([]);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { setCurrentAssessment, clearCurrentAssessment, filters, currentAssessment, setFilters } =
    useAssessmentStore();

  const queryObj = {
    page: currentPage || 1,
    limit: itemsPerPage || 10,
    name: filters.name !== 'all' ? filters.name : undefined,
    created_by: filters.created_by !== 'all' ? filters.created_by : undefined,
    created_from: filters.created_duation?.from,
    created_to: filters.created_duation?.to,
  };

  const cleanedQuery = qs.stringify(queryObj);

  const {
    data: assessmentsData,
    error,
    isLoading,
    mutate: assessmentMutate,
    isValidating
  } = useSWR(`${assessmentEndpoint.LIST}?${cleanedQuery}`, api.get);

  useEffect(() => {
    if (assessmentsData) {
      setAssessments(assessmentsData.data.list);
      setCurrentPage(assessmentsData.data.page);
      setCurrentPageStart((assessmentsData.data.page - 1) * itemsPerPage + 1);
      setCurrentPageEnd(
        Math.min(assessmentsData.data.page * itemsPerPage, assessmentsData.data.total)
      );
    }
  }, [assessmentsData]);

  const handleEdit = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    clearCurrentAssessment();
  };

  const handleCancel = () => {
    clearCurrentAssessment();
    setEditing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteData(`/assessment/${id}`);
      if (res.success) {
        toast.success('Assessment deleted successfully');
      }
      mutate((key: string) => typeof key === 'string' && key.startsWith('/assessment/list'));
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPageStart((page - 1) * itemsPerPage + 1);
    setCurrentPageEnd(Math.min(page * itemsPerPage, assessments.length));
    setCurrentPage(page);
  };
  const handlePerPageChange = (perPage: string) => {
    setItemsPerPage(Number(perPage));
    setCurrentPageStart(1);
    setCurrentPageEnd(Math.min(Number(perPage) * currentPage, assessments.length));
    setCurrentPage(1);
  };


  useEffect(() => {
    const params = new URLSearchParams();

    params.set('page', currentPage.toString());
    params.set('perPage', itemsPerPage.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, typeof value == 'object' ? JSON.stringify(value) : value);
      }

    });

    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters, pathname]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get('page')) setCurrentPage(Number(params.get('page')));
    if (params.get('perPage')) setItemsPerPage(Number(params.get('perPage')));

    const filterParams = {
      name: params.get('name') || '',
      view: params.get('view') || '',
      created_by: params.get('created_by') || '',
      created_duation: params.get('created_duation') ? JSON.parse(params.get('created_duation') as string) : undefined,
    };
    setFilters(filterParams as AssessmentFilters);
  }, []);


  if (editing) {
    return currentAssessment ? (
      <AssessmentEdit assessment={currentAssessment} onSave={handleSave} onCancel={handleCancel} />
    ) : null;
  }

  return (
    <div className="p-4 bg-white dark:bg-[#334155] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      <StatusWrapper
        error={error}
        loading={isLoading || isValidating}
        reset={assessmentMutate}
        className="min-h-[500px]"
      >
        <Pagination
          className="flex-grow min-h-[500px]"
          currentPageStart={currentPageStart}
          currentPageEnd={currentPageEnd}
          totalItems={assessmentsData?.data?.total || 0}
          itemsPerPage={itemsPerPage}
          onPerPageChange={handlePerPageChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          loading={false}
        >
          <div className="h-[550px] overflow-auto">
            {!error &&
              assessments &&
              assessments.map((assessment: Required<Assessment>) => (
                <AssessmentItem
                  key={assessment.id}
                  assessmentId={assessment.id}
                  title={assessment.name}
                  createdBy={assessment.created_by_user?.name || ''}
                  createdDate={assessment.created_at}
                  duration={assessment.duration}
                  technologies={assessment.technologies}
                  isExpanded={expandedId === assessment.id}
                  onToggle={() => setExpandedId(expandedId === assessment.id ? '' : assessment.id)}
                  handleEdit={() => handleEdit(assessment)}
                  handleDelete={handleDelete}
                />
              ))}
          </div>
        </Pagination>
      </StatusWrapper>
    </div>
  );
}
