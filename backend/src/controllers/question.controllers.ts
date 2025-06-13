import { Request, Response, NextFunction } from 'express';
import QuestionsService from '../services/question.services';
import { generateResponse } from '../utils/generateResponse';


const questionsService = new QuestionsService();
export class QuestionsController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await questionsService.createQuestion(req.body);
      return generateResponse(res, 200, question, true, 'Question created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingQuestion = await questionsService.getQuestionById(id);
      if (!existingQuestion) {
        return generateResponse(res, 404, {}, false, 'Question not found!');
      }

      const updatedQuestion = await questionsService.updateQuestion(id, req.body);

      return generateResponse(res, 200, updatedQuestion, true, 'Question updated successfully');
    } catch (error) {
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingQuestion = await questionsService.getQuestionById(id);
      if (!existingQuestion) {
        return generateResponse(res, 404, {}, false, 'Question not found!');
      }
      await questionsService.deleteQuestion(id);
      return generateResponse(res, 200, {}, true, 'Question delete successfully');
    } catch (error) {
      next(error);
    }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query;
      const assessmentData = await questionsService.getQuestionByTechnologyId(search);
      return generateResponse(res, 200, assessmentData, true, 'Question fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const question = await questionsService.getQuestionById(id);
      if (!question) {
        return generateResponse(res, 404, {}, false, 'Question not found!');
      }
      return generateResponse(res, 200, question, true, 'Question fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getQuestionByTechnologyId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { technology } = req.params;
      const search = req.query;
      const assessmentData = await questionsService.getQuestionByTechnologyId(search);
      return generateResponse(res, 200, assessmentData, true, 'Question fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  downloadQuestionFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = await questionsService.downloadQuestionFile();
      res.setHeader('Content-Disposition', 'attachment; filename="questions-import-template.xlsx"');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  importQuestionsFromXlsx = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return generateResponse(res, 400, {}, false, 'No file uploaded');
      }

      const result = await questionsService.importQuestionsFromXlsx(req.file.buffer);
      
      return generateResponse(
        res, 
        200, 
        result, 
        result.errors.length === 0, 
        result.errors.length === 0 
          ? 'Questions imported successfully'
          : `Imported ${result.totalImported} questions with ${result.errors.length} errors`
      );
    } catch (error) {
      next(error);
    }
  };
}