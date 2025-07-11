import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../utils/generateResponse';
import { ResultService } from '../services/result.services';
const resultService = new ResultService();

export class ResultController {
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const resultData = await resultService.get(id);
      return generateResponse(res, 200, resultData, true, 'Result fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.query;
      const resultData = await resultService.list(params);
      return generateResponse(res, 200, resultData, true, 'Results fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resultId,questionId,score } = req.body;

      const answer = await resultService.updateScore(resultId,questionId,score);
      generateResponse(res, 200, answer, true, "Successfully update");
    } catch (error) {
      next(error);
    }
  };
  getFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resultId } = req.params;
      const feedbackData = await resultService.getFeedback(resultId);
      return generateResponse(res, 200, feedbackData, true, 'Feedback fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
