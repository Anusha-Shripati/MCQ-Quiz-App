import { Request, Response, NextFunction } from 'express';
import { PlanService } from '../services/plan.service';
import { generateResponse } from '../../utils/generateResponse';

export class PlanController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, price, limits, features } = req.body;
      const planService = new PlanService(req.context!.prisma);

      const { plans: existingPlans } = await planService.findManyPlans({ search: name });
      if (existingPlans.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        return generateResponse(res, 400, {}, false, 'Plan with this name already exists');
      }

      const plan = await planService.createPlan({
        name,
        description,
        price,
        limits,
        features,
        created_by: req.user?.id,
      });

      return generateResponse(res, 201, plan, true, 'Plan created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { is_active, search, page = '1', limit = '10' } = req.query;
      const planService = new PlanService(req.context!.prisma);

      const filter: any = {};
      if (is_active !== undefined) {
        filter.is_active = is_active === 'true';
      }
      if (search) {
        filter.search = search as string;
      }
      filter.page = parseInt(page as string);
      filter.limit = parseInt(limit as string);

      const { plans, total } = await planService.findManyPlans(filter);

      return generateResponse(
        res,
        200,
        { list: plans, count: plans.length, total },
        true,
        'Plans retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const planService = new PlanService(req.context!.prisma);

      const plan = await planService.findPlanById(id);

      if (!plan) {
        return generateResponse(res, 404, {}, false, 'Plan not found');
      }

      return generateResponse(res, 200, plan, true, 'Plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, description, price, limits, features } = req.body;
      const planService = new PlanService(req.context!.prisma);

      const existingPlan = await planService.findPlanById(id);
      if (!existingPlan) {
        return generateResponse(res, 404, {}, false, 'Plan not found');
      }

      if (name && name !== existingPlan.name) {
        const { plans: duplicatePlans } = await planService.findManyPlans({ search: name });
        if (duplicatePlans.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== id)) {
          return generateResponse(res, 400, {}, false, 'Plan with this name already exists');
        }
      }

      const updatedPlan = await planService.updatePlan(id, {
        name,
        description,
        price,
        limits,
        features,
      });

      return generateResponse(res, 200, updatedPlan, true, 'Plan updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const planService = new PlanService(req.context!.prisma);

      const plan = await planService.findPlanById(id);
      if (!plan) {
        return generateResponse(res, 404, {}, false, 'Plan not found');
      }

      await planService.deletePlan(id);

      return generateResponse(res, 200, {}, true, 'Plan deleted successfully');
    } catch (error: any) {
      if (error.message === 'Cannot delete plan with active tenants') {
        return generateResponse(res, 400, {}, false, error.message);
      }
      next(error);
    }
  };

  toggle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const planService = new PlanService(req.context!.prisma);

      const updatedPlan = await planService.toggleActive(id);

      return generateResponse(
        res,
        200,
        updatedPlan,
        true,
        `Plan ${updatedPlan.is_active ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error: any) {
      if (error.message === 'Plan not found') {
        return generateResponse(res, 404, {}, false, error.message);
      }
      next(error);
    }
  };

  getTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const planService = new PlanService(req.context!.prisma);

      const plan = await planService.findPlanById(id);
      if (!plan) {
        return generateResponse(res, 404, {}, false, 'Plan not found');
      }

      const tenants = await planService.getPlanTenants(id);

      return generateResponse(
        res,
        200,
        { list: tenants, count: tenants.length },
        true,
        'Plan tenants retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
