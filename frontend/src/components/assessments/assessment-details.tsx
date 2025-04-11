"use client";

import { useCallback, useEffect,  useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import AssessmentEdit from "./assessment-edit";
import { toast } from "react-hot-toast";
import { Assessment, Technology, useAssessmentStore } from "@/store/assessmentStore";
import { LoadingSpinner } from "../ui/loading-spinner";
import Error from "@/app/error";
import useSWR, { mutate } from "swr";
import Pagination from "../pagination";
import { api, deleteData, fetcher, isAxiosError } from "@/lib/api";
import qs from 'query-string';
import dayjs from "dayjs";

interface AssessmentItemProps {
  key: string,
  assessmentId: string,
  title: string;
  createdBy: string;
  createdDate: string;
  duration: string | number;
  technologies?: Technology[];
  isExpanded: boolean;
  onToggle: () => void;
  handleEdit: () => void;
  handleDelete: (id: string) => void
}

function AssessmentItem({
  assessmentId,
  title,
  createdBy,
  createdDate,
  duration,
  technologies,
  isExpanded,
  onToggle,
  handleEdit,
  handleDelete
}: AssessmentItemProps) {

  const initial = { easy: 0, medium: 0, hard: 0 }
  const totalQuestions = technologies?.reduce(
    (total, tech) => ({
      easy: total.easy + tech.easy,
      medium: total.medium + tech.medium,
      hard: total.hard + tech.hard,
    }),
    initial
  ) || initial;


  const total = (totalQuestions?.easy || 0) + (totalQuestions?.medium || 0) + (totalQuestions?.hard || 0)
  
  const getPercentage = (count: number) => {
    if (!total) return '0.00%'
    return `${Math.round((count / total) * 100)}%`
  }

  const calculateTechPer=useCallback((technology:Technology)=>{
    const totalTech = (technology?.easy || 0) + (technology?.medium || 0) + (technology?.hard || 0)
    if (!totalTech) return '0.00%'
    return `${Math.round((totalTech / total) * 100)}%`
  },[assessmentId])
  return (
    <div className="border-b">
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Created by <span className="text-gray-700 font-medium dark:text-gray-300">{createdBy}</span> on <span className="text-gray-700 font-medium dark:text-gray-300">{dayjs(createdDate).format("DD MMM YYYY h:m A")}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Duration: <span className="text-gray-700 font-medium dark:text-gray-300">{duration} minutes</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleEdit}>
            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(assessmentId)}>
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
              <div className="font-medium text-gray-700 dark:text-gray-300 text-right">Total Questions</div>
            </div>
            {technologies.map((tech) => (
              <div key={tech.id} className="grid grid-cols-5 gap-4 py-2">
                <div className="text-gray-900 dark:text-gray-300 font-medium">
                  {tech?.technology?.name} <span className="text-gray-500">({calculateTechPer(tech)})</span>
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
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">{totalQuestions?.easy}</div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">{totalQuestions?.medium}</div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">{totalQuestions?.hard}</div>
              <div className="text-center font-semibold text-blue-600">
                {total}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentDetails() {
  const [expandedId, setExpandedId] = useState<string>("mern");
  const [editing, setEditing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPageStart, setCurrentPageStart] = useState<number>(1);
  const [currentPageEnd, setCurrentPageEnd] = useState<number>(1);
  const [assessments,setAssessments]=useState<Required<Assessment>[]>([])

  const {setCurrentAssessment, clearCurrentAssessment, filters, currentAssessment } = useAssessmentStore()
  
  const queryObj = {
    page: currentPage || 1,
    limit: itemsPerPage || 10,
    name: filters.name !== 'all' ? filters.name : undefined,
    created_by: filters.created_by !== 'all' ? filters.created_by : undefined,
    created_from: filters.created_duation?.from,
    created_to: filters.created_duation?.to,
  };

  const cleanedQuery = qs.stringify(queryObj);

  const { data:assessmentsData, error, isLoading } = useSWR(
    `/assessment/list?${cleanedQuery}`,
    api.get
  );

  useEffect(()=>{
      if(assessmentsData){
        setAssessments(assessmentsData.data.list)
        setCurrentPage(assessmentsData.data.page)
        setCurrentPageStart((assessmentsData.data.page - 1) * itemsPerPage + 1)
        setCurrentPageEnd(Math.min(assessmentsData.data.page * itemsPerPage, assessmentsData.data.total))
      }
  },[assessmentsData])


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
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await deleteData(`/assessment/${id}`)
        if (res.success) {
          toast.success("Assessment deleted successfully");
        }
        mutate((key) => typeof key === 'string' && key.startsWith('/assessment/list'));
      } catch (error) {
          if (isAxiosError(error)) {
              toast.error(error.response.data.message || "An unexpected error occurred");
          } else {
              toast.error("An unexpected error occurred");
          }
      }
      }
    }

  if (isLoading) {
    return ;
  }

  if (error) {
    return <Error error={error} reset={() => window.location.reload()} />
  }

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
  if (editing) {

    return currentAssessment ? (
      <AssessmentEdit
        assessment={currentAssessment}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    ) : null;
  }


  return (
    <div className="p-4 bg-white dark:bg-[#334155] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">

      <Pagination
        className="flex-grow"
        currentPageStart={currentPageStart}
        currentPageEnd={currentPageEnd}
        totalItems={assessmentsData?.data?.total || 0}
        itemsPerPage={itemsPerPage}
        onPerPageChange={handlePerPageChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >

        <div className="h-[600px] overflow-auto">
          {
            isLoading && <LoadingSpinner className="h-full w-full" />
          }
          {!isLoading && !error && assessments && assessments.map((assessment:Required<Assessment>) => (
            <AssessmentItem
              key={assessment.id}
              assessmentId={assessment.id}
              title={assessment.name}
              createdBy={assessment.created_by_user?.name || ''}
              createdDate={assessment.created_at}
              duration={assessment.duration}
              technologies={assessment.technologies}
              isExpanded={expandedId === assessment.id}
              onToggle={() => setExpandedId(expandedId === assessment.id ? "" : assessment.id)}
              handleEdit={() => handleEdit(assessment)}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      </Pagination>

    </div >
  );
}
