"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssessmentEdit from "./assessment-edit";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentAssessment, deleteAssessment } from "../../store/features/assessmentSlice";
import { RootState } from "../../store/store";
import { toast } from "react-hot-toast";

interface Technology {
  name: string;
  percentage: number;
  questions: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface AssessmentItemProps {
  key:string,
  title: string;
  createdBy: string;
  createdDate: string;
  duration: number;
  technologies?: Technology[];
  isExpanded: boolean;
  onToggle: () => void;
  handleEdit: () => void;
  handleDelete: (id:string) => void
}

function AssessmentItem({
  key,
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
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Created by <span className="text-gray-700 font-medium dark:text-gray-300">{createdBy}</span> on {createdDate}
          </p>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Duration: <span className="font-medium dark:text-gray-300">{duration} minutes</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleEdit}>
            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={()=>handleDelete(key)}>
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
                Easy (50%)
              </div>
              <div className="text-center font-medium text-gray-700 bg-blue-100 rounded-full px-2 py-1">
                Medium (50%)
              </div>
              <div className="text-center font-medium text-gray-700 bg-red-100 rounded-full px-2 py-1">
                Hard (50%)
              </div>
              <div className="font-medium text-gray-700 dark:text-gray-300 text-right">Total Questions</div>
            </div>
            {technologies.map((tech) => (
              <div key={tech.name} className="grid grid-cols-5 gap-4 py-2">
                <div className="text-gray-900 dark:text-gray-300 font-medium">
                  {tech.name} <span className="text-gray-500">({tech.percentage}%)</span>
                </div>
                <div className="text-center text-gray-800 dark:text-gray-300">{tech.questions.easy}</div>
                <div className="text-center text-gray-800 dark:text-gray-300">{tech.questions.medium}</div>
                <div className="text-center text-gray-800 dark:text-gray-300">{tech.questions.hard}</div>
                <div className="text-center text-gray-800 dark:text-gray-300 font-semibold">
                  {tech.questions.easy + tech.questions.medium + tech.questions.hard}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-5 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-gray-300">Total</div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">20</div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">20</div>
              <div className="text-center font-semibold text-gray-900 dark:text-gray-300">20</div>
              <div className="text-center font-semibold text-blue-600">
                {technologies.reduce((total, tech) => total + tech.questions.easy + tech.questions.medium + tech.questions.hard, 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentDetails() {
  const { assessments, isLoading, error } = useSelector((state: RootState) => state.assessment);
  const dispatch = useDispatch();
  const [expandedId, setExpandedId] = useState<string>("mern");
  const [editing, setEditing] = useState<boolean>(false);

  const handleEdit = (id: string) => {
    dispatch(setCurrentAssessment(id));
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      dispatch(deleteAssessment(id));
      toast.success("Assessment deleted successfully");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (assessments.length === 0) {
    return <div>No assessments found</div>;
  }

  if (editing) {
    const assessment = assessments.find(a => a.id === expandedId);
    
    return assessment ? (
      <AssessmentEdit
        assessment={assessment}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    ) : null;
  }
  

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <AssessmentItem
          key={assessment.id}
          title={assessment.title}
          createdBy={assessment.createdBy}
          createdDate={assessment.createdDate}
          duration={assessment.duration}
          technologies={assessment.technologies}
          isExpanded={expandedId === assessment.id}
          onToggle={() => setExpandedId(expandedId === assessment.id ? "" : assessment.id)}
          handleEdit={() => handleEdit(assessment.id)}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}
