import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { generateResponse } from '../../utils/generateResponse';

export class TenantController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, plan_id, db_name, db_url, admin_email, admin_name, status, trial_ends_at, subscription_ends_at } = req.body;
      const tenantService = new TenantService(req.context!.prisma);

      const existingTenant = await tenantService.findTenantBySlug(slug);
      if (existingTenant) {
        return generateResponse(res, 400, {}, false, 'Tenant with this slug already exists');
      }

      const tenant = await tenantService.createTenant({
        name,
        slug,
        plan_id,
        db_name,
        db_url,
        admin_email,
        admin_name,
        status,
        trial_ends_at: trial_ends_at ? new Date(trial_ends_at) : undefined,
        subscription_ends_at: subscription_ends_at ? new Date(subscription_ends_at) : undefined,
        created_by: req.user?.id,
      });

      return generateResponse(res, 201, tenant, true, 'Tenant created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, plan_id, search, page = '1', limit = '10' } = req.query;
      const tenantService = new TenantService(req.context!.prisma);

      const filter: any = {};
      if (status) filter.status = status as string;
      if (plan_id) filter.plan_id = plan_id as string;
      if (search) filter.search = search as string;
      filter.page = parseInt(page as string);
      filter.limit = parseInt(limit as string);

      const { tenants, total } = await tenantService.findManyTenants(filter);

      return generateResponse(
        res,
        200,
        { list: tenants, count: tenants.length, total },
        true,
        'Tenants retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);

      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      return generateResponse(res, 200, tenant, true, 'Tenant retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, slug, plan_id, admin_email, admin_name } = req.body;
      const tenantService = new TenantService(req.context!.prisma);

      const existingTenant = await tenantService.findTenantById(id);
      if (!existingTenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      if (slug && slug !== existingTenant.slug) {
        const duplicateTenant = await tenantService.findTenantBySlug(slug);
        if (duplicateTenant) {
          return generateResponse(res, 400, {}, false, 'Tenant with this slug already exists');
        }
      }

      const updatedTenant = await tenantService.updateTenant(id, {
        name,
        slug,
        plan_id,
        admin_email,
        admin_name,
      });

      return generateResponse(res, 200, updatedTenant, true, 'Tenant updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      await tenantService.deleteTenant(id);

      return generateResponse(res, 200, {}, true, 'Tenant deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      await tenantService.hardDeleteTenant(id);

      return generateResponse(res, 200, {}, true, 'Tenant and database deleted permanently');
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      const updatedTenant = await tenantService.updateStatus(id, status);

      return generateResponse(res, 200, updatedTenant, true, `Tenant status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { trial_ends_at, subscription_ends_at } = req.body;
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      const updatedTenant = await tenantService.updateSubscription(id, {
        trial_ends_at: trial_ends_at ? new Date(trial_ends_at) : undefined,
        subscription_ends_at: subscription_ends_at ? new Date(subscription_ends_at) : undefined,
      });

      return generateResponse(res, 200, updatedTenant, true, 'Subscription updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getUsage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      const usage = await tenantService.getTenantUsage(id);

      return generateResponse(
        res,
        200,
        { list: usage, count: usage.length },
        true,
        'Tenant usage retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
