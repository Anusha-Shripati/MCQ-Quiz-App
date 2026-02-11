import { Request, Response, NextFunction } from 'express';
import ModuleService from '../services/module.services';
import { generateResponse } from '../../utils/generateResponse';

export interface Permissions {
  can_edit: boolean;
  can_read: boolean;
  module_id: string;
}

export interface RolePayload {
  name: string;
  permission: Permissions[];
}

export class ModuleController {
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.query;
      const moduleService = new ModuleService(req.context!.prisma);
      
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
