import { Request, Response, NextFunction } from 'express';
import { TechnologyService } from '../services/technology.services';
import { generateResponse } from '../utils/generateResponse';
import QuestionService from '../services/question.services';

const technologyService = new TechnologyService();
export class TechnologyController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const technology = await technologyService.getTechnologyByName(name);
      if (technology) {
        const newTechnology = await technologyService.updateTechnology(technology.id, {
          name,
          deleted_at: null,
        });
        return generateResponse(res, 200, newTechnology, false, 'Technology created successfully');
      }
      const newTechnology = await technologyService.createTechnology({ name });
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
      const { name } = req.body;
      const existingTechnology = await technologyService.getTechnologyById(id);
      if (!existingTechnology) {
        return generateResponse(res, 400, {}, false, 'Technology not found');
      }

      if (existingTechnology.name !== name) {
        const duplicateTechnology = await technologyService.getTechnologyByName(name);
        if (duplicateTechnology) {
          return generateResponse(res, 400, {}, false, 'Technology name already exists');
        }
      }
      const updatedTechnology = await technologyService.updateTechnology(id, {
        name,
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

      if (existingTechnology?.questions?.length > 0) {
        return generateResponse(
          res,
          400,
          {},
          false,
          'There are questions associated with this technology'
        );
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
