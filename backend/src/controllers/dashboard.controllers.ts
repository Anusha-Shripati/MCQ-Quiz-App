import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../utils/generateResponse';
import { DashboardService } from '../services/dashboard.services';

const dashboardService = new DashboardService();
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
      const { language, score } = req.query as { language: string; score: string };
      const questionData = await dashboardService.interviewScoreData({ language, score });
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
      const interviewData = await dashboardService.calendarData();
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
