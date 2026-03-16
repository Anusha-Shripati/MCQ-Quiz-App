import { Request, Response, NextFunction } from 'express';
import QuestionsService from '../services/question.services';
import { generateResponse } from '../../utils/generateResponse';
import { UsageService } from '../../platform/services/usage.service';
import { UsageMetric } from '../../db/prisma/generated/client';
import { getPrisma } from '../../db/prisma/client';

export class QuestionsController {
  private usageService: UsageService;

  constructor() {
    this.usageService = new UsageService(getPrisma());
  }
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log('Creating question with data............:', req.body);
      const questionsService = new QuestionsService(req.context!.prisma);
      
      const question = await questionsService.createQuestion({...req.body,created_by:req.user?.id});
      await this.usageService.incrementUsage(req.context!.tenant!.id, UsageMetric.questions);

      return generateResponse(res, 200, question, true, 'Question created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const questionsService = new QuestionsService(req.context!.prisma);
      
      const existingQuestion = await questionsService.getQuestionById(id);
      if (!existingQuestion) {
        return generateResponse(res, 404, {}, false, 'Question not found!');
      }
      const question = await questionsService.getQuestionByName(req.body.question)
      if(question && question?.length && question[0]?.id != id){
        return generateResponse(res, 404, {}, false, 'Question name already exists!');
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
      const questionsService = new QuestionsService(req.context!.prisma);

      const existingQuestion = await questionsService.getQuestionById(id);
      if (!existingQuestion) {
        return generateResponse(res, 404, {}, false, 'Question not found!');
      }

      await questionsService.deleteQuestion(id);
      // Removed decrementUsage call - usage tracks creation limits per period

      return generateResponse(res, 200, {}, true, 'Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      return generateResponse(
        res,
        500,
        {},
        false,
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query;
      const questionsService = new QuestionsService(req.context!.prisma);
      
      const assessmentData = await questionsService.getQuestionByTechnologyId(search);
      return generateResponse(res, 200, assessmentData, true, 'Question fetched successfully');
    } catch (error) {
      next(error);
    }
  };
  getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const questionsService = new QuestionsService(req.context!.prisma);
      
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
      const search = req.query;
      const questionsService = new QuestionsService(req.context!.prisma);
      
      const assessmentData = await questionsService.getQuestionByTechnologyId(search);
      return generateResponse(res, 200, assessmentData, true, 'Question fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  downloadQuestionFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questionsService = new QuestionsService(req.context!.prisma);
      
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
      const file = req.file;
      const { technologyId } = req.body;
      const questionsService = new QuestionsService(req.context!.prisma);
      
      const result = await questionsService.importQuestionsFromXlsx(file.buffer, technologyId, req.user?.id || '');

      if (result.totalImported > 0) {
        await this.usageService.incrementUsage(
          req.context!.tenant!.id,
          UsageMetric.questions,
          result.totalImported
        );
      }

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
  getTechnology = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questionsService = new QuestionsService(req.context!.prisma);
      
      const technology = await questionsService.getTechnology();
      return generateResponse(res, 200, technology, true, 'Technology fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
