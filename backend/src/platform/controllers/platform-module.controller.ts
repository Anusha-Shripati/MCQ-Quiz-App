import { Request, Response, NextFunction } from 'express';
import PlatformModuleService from '../services/platform-module.service';
import { generateResponse } from '../../utils/generateResponse';

export class PlatformModuleController {
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.query;
      const moduleService = new PlatformModuleService(req.context!.prisma);
      
      const modules = await moduleService.getModules({
        name: name as string,
      });
      return generateResponse(
        res,
        200,
        { list: modules, count: modules.length },
        true,
        'Modules fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
