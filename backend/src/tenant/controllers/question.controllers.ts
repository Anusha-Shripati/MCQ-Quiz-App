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
  createMultiple = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Creating multiple questions with data:', req.body);
      const { technology_id, questions } = req.body;
      const questionsService = new QuestionsService(req.context!.prisma);
      
      // Check if we have enough usage limit for all questions
      const usageCheck = await this.usageService.checkUsageLimit(
        req.context!.tenant!.id,
        UsageMetric.questions
      );
      
      if (!usageCheck.unlimited) {
        const remainingLimit = usageCheck.limit - usageCheck.current;
        if (questions.length > remainingLimit) {
          return generateResponse(
            res,
            400,
            {
              error: 'USAGE_LIMIT_EXCEEDED',
              data: {
                current: usageCheck.current,
                limit: usageCheck.limit,
                remaining: remainingLimit,
                requested: questions.length,
              },
            },
            false,
            `Cannot create ${questions.length} questions. Only ${remainingLimit} questions remaining in your plan (${usageCheck.current}/${usageCheck.limit} used).`
          );
        }
      }
      
      const createdQuestions = [];
      
      // Create questions one by one to maintain data integrity
      for (const questionData of questions) {
        // Clean up the question data - remove extra fields and filter empty options
        const cleanedQuestionData = {
          ...questionData,
          technology_id, // Use the root level technology_id
          created_by: req.user?.id || '',
          // Filter out empty options for question types that need options
          options: ['mcq', 'multiple_select', 'code_snippet', 'code_snippet_with_mcq'].includes(questionData.type)
            ? questionData.options?.filter((opt: string) => opt && opt.trim()) || []
            : questionData.options || [],
        };
        
        // Remove fields that shouldn't be passed to the service
        delete cleanedQuestionData.time; // Remove time field if present
        if (cleanedQuestionData.technology_id === technology_id) {
          // Remove duplicate technology_id from question object since we're using root level
          const { technology_id: _, ...questionWithoutTechId } = cleanedQuestionData;
          cleanedQuestionData.technology_id = technology_id;
        }
        
        const question = await questionsService.createQuestion(cleanedQuestionData);
        createdQuestions.push(question);
      }
      
      // Increment usage by the number of questions created
      await this.usageService.incrementUsage(
        req.context!.tenant!.id,
        UsageMetric.questions,
        createdQuestions.length
      );

      return generateResponse(
        res,
        200,
        {
          questions: createdQuestions,
          totalCreated: createdQuestions.length,
        },
        true,
        `${createdQuestions.length} questions created successfully`
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Creating question with data............:', req.body);
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
      
      // Parse the Excel file to count questions before importing
      const XLSX = require('xlsx');
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const questions = XLSX.utils.sheet_to_json(worksheet);
      
      if (questions.length === 0) {
        return generateResponse(res, 400, {}, false, 'The uploaded file contains no data or has an incorrect format');
      }
      
      // Check if we have enough usage limit for all questions
      const usageCheck = await this.usageService.checkUsageLimit(
        req.context!.tenant!.id,
        UsageMetric.questions
      );
      
      if (!usageCheck.unlimited) {
        const remainingLimit = usageCheck.limit - usageCheck.current;
        if (questions.length > remainingLimit) {
          return generateResponse(
            res,
            400,
            {
              error: 'USAGE_LIMIT_EXCEEDED',
              data: {
                current: usageCheck.current,
                limit: usageCheck.limit,
                remaining: remainingLimit,
                requested: questions.length,
              },
            },
            false,
            `Cannot import ${questions.length} questions. Only ${remainingLimit} questions remaining in your plan (${usageCheck.current}/${usageCheck.limit} used).`
          );
        }
      }
      
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
