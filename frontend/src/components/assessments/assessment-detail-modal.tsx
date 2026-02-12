'use client';

import { Clock, User, Calendar, BookOpenCheck } from 'lucide-react';
import { Assessment, Technology } from '@/store/assessmentStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';

interface AssessmentDetailModalProps {
  assessment: Assessment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssessmentDetailModal({ assessment, isOpen, onClose }: AssessmentDetailModalProps) {
  if (!assessment) return null;

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

  const calculateTechPer = (technology: Technology) => {
    const totalTech = (technology?.easy.total || 0) + (technology?.medium.total || 0) + (technology?.hard.total || 0);
    if (!totalTech) return '0%';
    return `${Math.round((totalTech / total) * 100)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {assessment.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created by</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {assessment.created_by_user?.name}
                  {assessment.created_by_user?.deleted_at && (
                    <span className="text-red-500 ml-1">(Deleted)</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created on</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {dayjs(assessment.created_at).format('MMM DD, YYYY')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {assessment.duration} minutes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pass Criteria</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {assessment.pass_criteria}%
                </p>
              </div>
            </div>
          </div>

          {/* Question Distribution Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                  {totalQuestions.easy}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Easy</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((totalQuestions.easy / total) * 100)}%
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                  {totalQuestions.medium}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Medium</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((totalQuestions.medium / total) * 100)}%
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                  {totalQuestions.hard}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Hard</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((totalQuestions.hard / total) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Technology Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technology Breakdown</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="font-semibold text-gray-700 dark:text-gray-300">Technology</div>
                <div className="text-center font-semibold text-gray-700 dark:text-gray-300">Easy</div>
                <div className="text-center font-semibold text-gray-700 dark:text-gray-300">Medium</div>
                <div className="text-center font-semibold text-gray-700 dark:text-gray-300">Hard</div>
                <div className="text-center font-semibold text-gray-700 dark:text-gray-300">Total</div>
                <div className="text-center font-semibold text-gray-700 dark:text-gray-300">Percentage</div>
              </div>
              
              {assessment.technologies?.map((tech, index) => (
                <div key={tech.id} className={`grid grid-cols-6 gap-4 p-4 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-25 dark:bg-gray-775'}`}>
                  <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {tech?.technology?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {tech?.technology?.name}
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {tech.easy.total}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {tech.medium.total}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {tech.hard.total}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {tech.easy.total + tech.medium.total + tech.hard.total}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {calculateTechPer(tech)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}