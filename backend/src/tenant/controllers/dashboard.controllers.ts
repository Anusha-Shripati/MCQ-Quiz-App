import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../../utils/generateResponse';
import { DashboardService } from '../services/dashboard.services';

interface InterviewScroreDataQuery {
  language: string,
  min: string,
  max: string,
  page: string,
  limit: string
}
export class DashboardController {
  questionData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const questionData = await dashboardService.getQuestionData();
      return generateResponse(res, 200, questionData, true, 'Question data retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
  interviewCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const questionData = await dashboardService.getInterviewCount();
      return generateResponse(
        res,
        200,
        questionData,
        true,
        'Interview count retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  interviewData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, customStart, customEnd } = req.query;
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const questionData = await dashboardService.getInterviewData(
        filter as string,
        customStart as string,
        customEnd as string
      );
      return generateResponse(
        res,
        200,
        questionData,
        true,
        'Interview data retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  interviewScroreData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { language, min, max, page, limit } = req.query as unknown as InterviewScroreDataQuery;
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const questionData = await dashboardService.interviewScoreData({ language, min, max, page, limit });
      return generateResponse(
        res,
        200,
        questionData,
        true,
        'Interview score data retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
  calendarData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month, year } = req.query
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const interviewData = await dashboardService.calendarData(month as string, year as string);
      return generateResponse(
        res,
        200,
        interviewData,
        true,
        'Calendar data retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  topAssignedAssessments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query;
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const topAssessments = await dashboardService.getTopAssignedAssessments(
        limit ? parseInt(limit as string) : 5
      );
      return generateResponse(
        res,
        200,
        topAssessments,
        true,
        'Top assigned assessments retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  questionTypePerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const questionTypeData = await dashboardService.getQuestionTypePerformance();
      return generateResponse(
        res,
        200,
        questionTypeData,
        true,
        'Question type performance retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  examDurationVsPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardService = new DashboardService(req.context!.prisma);
      
      const durationPerformanceData = await dashboardService.getExamDurationVsPerformance();
      return generateResponse(
        res,
        200,
        durationPerformanceData,
        true,
        'Exam duration vs performance retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
