import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../utils/generateResponse';
import { DashboardService } from '../services/dashboard.services';

const dashboardService = new DashboardService();
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
      const questionData = await dashboardService.getQuestionData();
      return generateResponse(res, 200, questionData, true, 'Question data retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
  interviewCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      const questionData = await dashboardService.getInterviewData();
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
}
