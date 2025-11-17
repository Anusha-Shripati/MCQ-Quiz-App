'use client';

import { useCallback, useEffect, useState } from 'react';
import { Edit, Trash2, Clock, User, Calendar, BookOpenCheck } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import AssessmentEdit from './assessment-edit';
import { toast } from 'react-hot-toast';
import {
  Assessment,
  AssessmentFilters,
  Technology,
  useAssessmentStore,
} from '@/store/assessmentStore';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HeightTransition } from '@/components/ui/animations/height-transition';
import { useAuthStore } from '@/store/authStore';
// import StatusWrapper from "../common/status-wrapper";

interface AssessmentItemProps {
  key: string;
  assessmentId: string;
  title: string;
  createdBy: {
    name: string;
    deleted_at: string;
  };
  createdDate: string;
  duration: string | number;
  pass_criteria: string | number;
  technologies?: Technology[];
  isExpanded: boolean;
  onToggle: () => void;
  handleEdit: () => void;
  handleDelete: (id: string) => void;
}

function AssessmentItem({
  assessmentId,
  title,
  createdBy,
  createdDate,
  duration,
  pass_criteria,
  technologies,
  isExpanded,
  onToggle,
  handleEdit,
  handleDelete,
}: AssessmentItemProps) {
  const initial = { easy: 0, medium: 0, hard: 0 };
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const { hasPermissionAssessmentEdit } = useAuthStore();
  const isAssessmentEditable = hasPermissionAssessmentEdit();

  const totalQuestions =
    technologies?.reduce(
      (total, tech) => ({
        easy: total.easy + tech.easy.total,
        medium: total.medium + tech.medium.total,
        hard: total.hard + tech.hard.total,
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
        (technology?.easy.total || 0) +
        (technology?.medium.total || 0) +
        (technology?.hard.total || 0);
      if (!totalTech) return '0.00%';
      return `${Math.round((totalTech / total) * 100)}%`;
    },
    [assessmentId]
  );
  // Prevent event bubbling from action buttons
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const onDelete = (assessmentId: string) => {
    setDeleteId(assessmentId);
    setDeleteOpen(true);
  };
  return (
    <div className="border-b">
      <DeleteDialog
        onDelete={() => handleDelete(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
      />
      <div
        className="px-6 py-8 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors duration-200"
        onClick={onToggle}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`tech-breakdown-${assessmentId}`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {title}
            </h3>
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-700">
              {total} Questions
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {createdBy.name}{' '}
                {createdBy.deleted_at ? <span className="text-red-500"> (Deleted)</span> : ''}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {dayjs(createdDate).format('DD MMM YYYY, h:mm A')}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Created on {dayjs(createdDate).format('DD MMM YYYY, h:mm A')}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {duration} minutes
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duration of the assessment in minutes.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpenCheck className="h-4 w-4 text-orange-600 dark:text-green-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {pass_criteria}%
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Passing criteria for this assessment.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Easy: {totalQuestions.easy} ({getPercentage(totalQuestions.easy)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Medium: {totalQuestions.medium} ({getPercentage(totalQuestions.medium)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hard: {totalQuestions.hard} ({getPercentage(totalQuestions.hard)})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={handleActionClick}>
          {/* <Button
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
          </Button> */}
          {/* add tooltip to edit and delete buttons */}
          {isAssessmentEditable && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Assessment</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                    onClick={() => onDelete(assessmentId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Assessment</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isExpanded ? 'Collapse Details' : 'Expand Details'}</p>
            </TooltipContent>
          </Tooltip> */}
        </div>
      </div>

      <HeightTransition isVisible={isExpanded && !!technologies}>
        <div
          id={`tech-breakdown-${assessmentId}`}
          className="border-t border-gray-200 dark:border-gray-600 dark:bg-gray-750 p-6"
        >
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            Technology Breakdown {title ? `(${title})` : ''}
          </h4>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="font-semibold text-gray-700 dark:text-gray-300">Technology</div>
              <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2"></div>
                  Easy
                </div>
              </div>
              <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2"></div>
                  Medium
                </div>
              </div>
              <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2"></div>
                  Hard
                </div>
              </div>
              <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Total
              </div>
              <div className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Percentage
              </div>
            </div>

            {technologies?.map((tech, index) => (
              <div
                key={tech.id}
                className={`grid grid-cols-6 gap-4 p-4 dark:hover:bg-gray-750 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-25 dark:bg-gray-775'
                }`}
              >
                <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {tech?.technology?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {tech?.technology?.name}
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border border-green-200 dark:border-green-700">
                    {tech.easy.total}
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border border-yellow-200 dark:border-yellow-700">
                    {tech.medium.total}
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border border-red-200 dark:border-red-700">
                    {tech.hard.total}
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border border-blue-200 dark:border-blue-700">
                    {tech.easy.total + tech.medium.total + tech.hard.total}
                  </span>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-700">
                    {calculateTechPer(tech)}
                  </span>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-6 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t-2 border-blue-200 dark:border-blue-600">
              <div className="font-bold text-gray-800 dark:text-gray-200 text-lg">Total</div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-md">
                  {totalQuestions?.easy}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-md">
                  {totalQuestions?.medium}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-md">
                  {totalQuestions?.hard}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-md">
                  {total}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </HeightTransition>
    </div>
  );
}

export default function AssessmentDetails() {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
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
    isValidating,
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

    params.set('page', '1');
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
      created_duation: params.get('created_duation')
        ? JSON.parse(params.get('created_duation') as string)
        : undefined,
    };
    setFilters(filterParams as AssessmentFilters);
  }, []);

  // Toggle function to add/remove IDs from the expandedIds array
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (editing) {
    return currentAssessment ? (
      <AssessmentEdit assessment={currentAssessment} onSave={handleSave} onCancel={handleCancel} />
    ) : null;
  }

  return (
    <StatusWrapper
      error={error}
      loading={isLoading || isValidating}
      reset={assessmentMutate}
      className="min-h-[74vh] flex"
    >
      <Pagination
        className="flex-grow"
        currentPageStart={currentPageStart}
        currentPageEnd={currentPageEnd}
        totalItems={assessmentsData?.data?.total || 0}
        itemsPerPage={itemsPerPage}
        onPerPageChange={handlePerPageChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        loading={false}
      >
        <div className="h-[65vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent">
          {!error &&
            assessments &&
            assessments.map((assessment: Required<Assessment>) => (
              <AssessmentItem
                key={assessment.id}
                assessmentId={assessment.id}
                title={assessment.name}
                createdBy={assessment.created_by_user || {}}
                createdDate={assessment.created_at}
                duration={assessment.duration}
                pass_criteria={assessment.pass_criteria}
                technologies={assessment.technologies}
                // Update to check if ID exists in the expandedIds array
                isExpanded={expandedIds.includes(assessment.id)}
                // Update toggle to use the new toggleExpanded function
                onToggle={() => toggleExpanded(assessment.id)}
                handleEdit={() => handleEdit(assessment)}
                handleDelete={handleDelete}
              />
            ))}
          {assessments.length == 0 && (
            <div className="w-full h-full flex justify-center items-center">No data found.</div>
          )}
        </div>
      </Pagination>
    </StatusWrapper>
  );
}
