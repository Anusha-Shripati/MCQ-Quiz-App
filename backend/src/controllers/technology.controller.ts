import { Request, Response, NextFunction } from 'express';
import { TechnologyService } from '../services/technology.services';
import { generateResponse } from '../utils/generateResponse';
const technologyService = new TechnologyService();
export class TechnologyController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, questions } = req.body;
      const trimName = name.trim();
      const technology = await technologyService.getTechnologyByName(trimName);
      if (technology && technology.deleted_at) {
        const newTechnology = await technologyService.updateTechnology(technology.id, {
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

      const updatedTechnology = await technologyService.updateTechnology(id, {
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
