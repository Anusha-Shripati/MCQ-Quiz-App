import { Request, Response, NextFunction } from 'express';
import { TechnologyService } from '../services/technology.services';
import { generateResponse } from '../utils/generateResponse';
import { prisma } from '../db/prisma.client';
const technologyService = new TechnologyService();
export class TechnologyController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, questions } = req.body;
      const trimName = name.trim();
      const technology = await technologyService.getTechnologyByName(trimName);
      if (technology && technology.deleted_at) {
        const newTechnology = await technologyService.updateTechnology(technology.id,req.user?.id||'', {
          name: trimName,
          deleted_at: null,
          questions,
        });
        return generateResponse(res, 200, newTechnology, true, 'Technology created successfully');
      } else if (technology) {
        return generateResponse(res, 400, {}, false, 'Technology name already exists');
      }
      const newTechnology = await technologyService.createTechnology({ name: trimName, questions });
      return generateResponse(res, 200, newTechnology, true, 'Technology created successfully');
    } catch (error) {
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
      const trimName = name.trim();

      const existingTechnology = await technologyService.getTechnologyById(id);
      if (!existingTechnology) {
        return generateResponse(res, 400, {}, false, 'Technology not found');
      }
      // if (existingTechnology.name.trim() != trimName) {
      //   const duplicateTechnology = await technologyService.getTechnologyByName(trimName);
      //   if (duplicateTechnology && !duplicateTechnology.deleted_at) {
      //     return generateResponse(res, 400, {}, false, 'Technology name already exists');
      //   } else if (duplicateTechnology) {
      //     await technologyService.deleteTechnology(duplicateTechnology.id);
      //   }
      // }
      // console.log('questions', questions);

      for (const question of questions) {
        if (
          (question.type === 'mcq' || question.type === 'multiple_select') &&
          (!Array.isArray(question.options) ||
            question.options.filter((opt: string) => opt && opt.trim() !== '').length < 4)
        ) {
          return generateResponse(
            res,
            400,
            { questionId: question.id || null },
            false,
            `Question "${question.question}" must have at least 4 non-empty options`
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
      const questionsArr = await prisma.questions.findMany({ where: { question: { in: questions.map((item: any) => item.question) },technology_id: id} })

      if (questionsArr.length) {
        return generateResponse(res, 400, { questions: questionsArr.map(item=>item.question) }, true, 'Questions already exists');

      }
      console.log(req.user);
      
      const updatedTechnology = await technologyService.updateTechnology(id, req.user?.id || '',{
        name: trimName,
        questions,
      });
      return generateResponse(res, 200, updatedTechnology, true, 'Technology updated successfully');
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
