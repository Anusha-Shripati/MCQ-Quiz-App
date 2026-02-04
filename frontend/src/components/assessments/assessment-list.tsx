'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, Clock, User, Calendar, BookOpenCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import { toast } from 'react-hot-toast';
import {
  Assessment,
  AssessmentFilters,
  useAssessmentStore,
} from '@/store/assessmentStore';
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
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import AssessmentDetailModal from './assessment-detail-modal';
import AssessmentEditModal from './assessment-edit-modal';

interface AssessmentCardProps {
  assessment: Required<Assessment>;
  onView: (assessment: Assessment) => void;
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
}

function AssessmentCard({ assessment, onView, onEdit, onDelete }: AssessmentCardProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const { hasPermissionAssessmentEdit } = useAuthStore();
  const isAssessmentEditable = hasPermissionAssessmentEdit();

  const initial = { easy: 0, medium: 0, hard: 0 };
  const totalQuestions = assessment.technologies?.reduce(
    (total, tech) => ({
      easy: total.easy + tech.easy.total,
      medium: total.medium + tech.medium.total,
      hard: total.hard + tech.hard.total,
    }),
    initial
  ) || initial;

  const total = (totalQuestions?.easy || 0) + (totalQuestions?.medium || 0) + (totalQuestions?.hard || 0);

  const handleDelete = (assessmentId: string) => {
    setDeleteId(assessmentId);
    setDeleteOpen(true);
  };

  return (
    <>
      <DeleteDialog
        onDelete={() => onDelete(deleteId as string)}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
      />
      <Card className="group relative overflow-hidden bg-white dark:bg-background border border-gray-200 dark:border-border hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-1">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onView(assessment)}
                className="text-left w-full group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {assessment.name}
                </h3>
              </button>
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                {total} Questions
              </Badge>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(assessment)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
              
              {isAssessmentEditable && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(assessment)}
                        className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200"
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
                        size="sm"
                        onClick={() => handleDelete(assessment.id!)}
                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
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
            </div>
          </div>

          {/* Content Grid - Left and Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Side */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="font-medium truncate">
                  {assessment.created_by_user?.name}
                  {assessment.created_by_user?.deleted_at && (
                    <span className="text-red-500 ml-1">(Deleted)</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="truncate">{dayjs(assessment.created_at).format('MMM DD, YYYY')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span>{assessment.duration} min</span>
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BookOpenCheck className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span>Pass: {assessment.pass_criteria}%</span>
              </div>
              
              {/* Difficulty Distribution */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Question Distribution
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-400">Easy: {totalQuestions.easy}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-400">Med: {totalQuestions.medium}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-400">Hard: {totalQuestions.hard}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies - Full Width */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {assessment.technologies?.slice(0, 3).map((tech) => (
                <Badge key={tech.id} variant="outline" className="text-xs truncate max-w-[120px]">
                  {tech.technology?.name}
                </Badge>
              ))}
              {assessment.technologies && assessment.technologies.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  +{assessment.technologies.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function AssessmentList() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPageStart, setCurrentPageStart] = useState<number>(1);
  const [currentPageEnd, setCurrentPageEnd] = useState<number>(1);
  const [assessments, setAssessments] = useState<Required<Assessment>[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { setCurrentAssessment, clearCurrentAssessment, filters, setFilters } = useAssessmentStore();

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

  const handleView = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setDetailModalOpen(true);
  };

  const handleEdit = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentAssessment(assessment);
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    setEditModalOpen(false);
    setSelectedAssessment(null);
    clearCurrentAssessment();
    assessmentMutate();
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setSelectedAssessment(null);
    clearCurrentAssessment();
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

  return (
    <>
      <StatusWrapper
        error={error}
        loading={isLoading || isValidating}
        reset={assessmentMutate}
        className="min-h-[83vh] flex"
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
            {!error && assessments && assessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                {assessments.map((assessment: Required<Assessment>) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No assessments found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>
        </Pagination>
      </StatusWrapper>

      {/* Detail Modal */}
      <AssessmentDetailModal
        assessment={selectedAssessment}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAssessment(null);
        }}
      />

      {/* Edit Modal */}
      <AssessmentEditModal
        assessment={selectedAssessment}
        isOpen={editModalOpen}
        onClose={handleEditCancel}
        onSave={handleEditSave}
      />
    </>
  );
}
