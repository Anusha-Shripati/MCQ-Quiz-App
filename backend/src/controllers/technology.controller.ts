import { Request, Response, NextFunction } from 'express';
import { TechnologyService } from '../services/technology.services';
import { generateResponse } from '../utils/generateResponse';
import { prisma } from '../db/prisma.client';
const technologyService = new TechnologyService();
export class TechnologyController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, questions } = req.body;
      const normalizeName = name.trim().toLowerCase();
      const technology = await technologyService.getTechnologyByName(normalizeName);
      if (technology && technology.deleted_at) {
        const newTechnology = await technologyService.updateTechnology(
          technology.id,
          req.user?.id || '',
          {
            name: normalizeName,
            deleted_at: null,
            questions,
          }
        );
        return generateResponse(res, 200, newTechnology, true, 'Technology created successfully');
      } else if (technology) {
        return generateResponse(res, 400, {}, false, 'Technology name already exists');
      }
      const newTechnology = await technologyService.createTechnology({
        name: normalizeName,
        questions,
      });
      return generateResponse(res, 200, newTechnology, true, 'Technology created successfully');
    } catch (error) {
      next(error);
    }
  };

  createTechnologyOnly = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const normalizeName = name.trim().toLowerCase();

      const existingTechnology = await technologyService.getTechnologyByName(normalizeName);
      if (existingTechnology && !existingTechnology.deleted_at) {
        return generateResponse(res, 400, {}, false, 'Technology name already exists');
      }

      const newTechnology = await technologyService.createTechnologyOnly({ name: normalizeName });
      return generateResponse(res, 201, newTechnology, true, 'Technology created successfully');
    } catch (error) {
      console.log('creae Technology err', error);
      next(error);
    }
  };
  getTechnologyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const technology = await technologyService.getTechnologyById(id);

      if (!technology) {
        return generateResponse(res, 400, {}, false, 'Technology not found');
      }
      return generateResponse(res, 200, technology, true, 'Technology fetch successfully');
    } catch (error) {
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, questions } = req.body;
      const normalizeName = name.trim().toLowerCase();

      const existingTechnology = await technologyService.getTechnologyById(id);
      if (!existingTechnology) {
        return generateResponse(res, 400, {}, false, 'Technology not found');
      }
      // if (existingTechnology.name.trim() != normalizeName) {
      //   const duplicateTechnology = await technologyService.getTechnologyByName(normalizeName);
      //   if (duplicateTechnology && !duplicateTechnology.deleted_at) {
      //     return generateResponse(res, 400, {}, false, 'Technology name already exists');
      //   } else if (duplicateTechnology) {
      //     await technologyService.deleteTechnology(duplicateTechnology.id);
      //   }
      // }
      // console.log('questions', questions);

      for (const question of questions) {
        if (
          (question.type === 'mcq' ||
            question.type === 'multiple_select' ||
            question.type === 'code_snippet' ||
            question.type === 'code_snippet_with_mcq') &&
          (!Array.isArray(question.options) ||
            question.options.filter((opt: string) => opt && opt.trim() !== '').length <
              (question.type === 'code_snippet' ? 2 : 4))
        ) {
          return generateResponse(
            res,
            400,
            { questionId: question.id || null },
            false,
            `Question "${question.question}" must have at least ${question.type === 'code_snippet' ? 2 : 4} non-empty options`
          );
        }
      }

      for (const question of questions) {
        if (question.type === 'mcq' || question.type === 'multiple_select') {
          const questionNames = questions.map((q: any) => q.question.trim());
          const duplicateQuestion = questionNames.find((q: string, index: number) => {
            return questionNames.indexOf(q) !== index;
          });
          if (duplicateQuestion) {
            return generateResponse(
              res,
              400,
              { question: duplicateQuestion },
              false,
              `Question already exists in your current stack at question ${questionNames.indexOf(duplicateQuestion) + 1}. Please change the question name.`
            );
          }
        }
      }

      // for (const question of questions) {
      //   if (question.type === 'mcq' || question.type === 'multiple_select') {
      //     const existingQuestion = await technologyService.getQuestionByName(
      //       question.question.trim()
      //     );
      //     if (existingQuestion && existingQuestion.id !== question.id) {
      //       return generateResponse(
      //         res,
      //         400,
      //         { questionId: question.id || null },
      //         false,
      //         `Question "${question.question}" already exists in the database. Please change the question name.`
      //       );
      //     }
      //   }
      // }
      // Only check for duplicates for questions that are NOT code_snippet_with_mcq or code_snippet
      const nonCodeMcqQuestions = questions.filter(
        (item: any) => item.type !== 'code_snippet_with_mcq' && item.type !== 'code_snippet'
      );
      const questionsArr = await prisma.questions.findMany({
        where: {
          question: { in: nonCodeMcqQuestions.map((item: any) => item.question) },
          technology_id: id,
        },
      });

      if (questionsArr.length) {
        return generateResponse(
          res,
          400,
          { questions: questionsArr.map((item) => item.question) },
          true,
          'Questions already exists'
        );
      }
      const updatedTechnology = await technologyService.updateTechnology(id, req.user?.id || '', {
        name: normalizeName,
        questions,
      });
      return generateResponse(res, 200, updatedTechnology, true, 'Technology updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateTechnologyName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const normalizeName = name.trim().toLowerCase();

      const existingTechnology = await technologyService.getTechnologyById(id);
      if (!existingTechnology) {
        return generateResponse(res, 404, {}, false, 'Technology not found');
      }

      // Check if name already exists (excluding current technology)
      const duplicateTechnology = await technologyService.getTechnologyByName(normalizeName);
      if (duplicateTechnology && duplicateTechnology.id !== id && !duplicateTechnology.deleted_at) {
        return generateResponse(res, 400, {}, false, 'Technology name already exists');
      }

      const updatedTechnology = await technologyService.updateTechnologyName(id, {
        name: normalizeName,
      });
      return generateResponse(
        res,
        200,
        updatedTechnology,
        true,
        'Technology name updated successfully'
      );
    } catch (error) {
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingTechnology = await technologyService.getTechnologyById(id);

      if (!existingTechnology) {
        return generateResponse(res, 400, {}, false, 'Technology not found');
      }

      await technologyService.deleteTechnology(id);

      return generateResponse(res, 200, {}, true, 'Technology deleted successfully');
    } catch (error) {
      next(error);
    }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      const technologies = await technologyService.getTechnologies({
        name: search as string,
      });
      return generateResponse(
        res,
        200,
        { list: technologies, count: technologies.length },
        true,
        'Technology fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  };
  // getTechnologyWithQuestion = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const technologies =
  //       await technologyService.getTechnologiesWithQuestions();
  //     return generateResponse(
  //       res,
  //       200,
  //       { list: technologies, count: technologies.length },
  //       true,
  //       "Technologies fetched successfully"
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
