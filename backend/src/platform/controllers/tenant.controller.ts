import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { ProvisioningService } from '../services/provisioning.service';
import { UsageService } from '../services/usage.service';
import { generateResponse } from '../../utils/generateResponse';

export class TenantController {
  private provisioningService: ProvisioningService;
  private usageService: UsageService;

  constructor() {
    // Services will be initialized with request context in each method
    this.provisioningService = new ProvisioningService(null as any);
    this.usageService = new UsageService(null as any);
  }
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, plan_id, db_name, db_url, admin_email, admin_name, status, subscription_starts_at, subscription_ends_at } = req.body;
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
        subscription_starts_at: subscription_starts_at ? new Date(subscription_starts_at) : undefined,
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
      const usageService = new UsageService(req.context!.prisma);

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

      // Check if plan is changing
      const planChanged = plan_id && plan_id !== existingTenant.plan_id;
      
      if (planChanged) {
        // Validate plan change first
        const validation = await usageService.validatePlanChange(id, plan_id);
        if (!validation.allowed) {
          return generateResponse(res, 400, { validation }, false, `Plan change not allowed: ${validation.issues.join(', ')}`);
        }
        
        // Apply plan change
        await usageService.applyPlanChange(id, plan_id);
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
      const { subscription_ends_at } = req.body;
      
      const usageService = new UsageService(req.context!.prisma);
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      if (!subscription_ends_at) {
        return generateResponse(res, 400, {}, false, 'subscription_ends_at is required');
      }

      // Use usage service for subscription extension (only end date)
      const updatedTenant = await usageService.extendSubscriptionEndDate({
        tenantId: id,
        subscription_ends_at: new Date(subscription_ends_at),
      });

      return generateResponse(res, 200, updatedTenant, true, 'Subscription end date updated successfully');
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return generateResponse(res, 404, {}, false, error.message);
      }
      next(error);
    }
  };

  validatePlanChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { new_plan_id } = req.body;
      
      const usageService = new UsageService(req.context!.prisma);
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      const validation = await usageService.validatePlanChange(id, new_plan_id);

      return generateResponse(res, 200, validation, true, 'Plan change validation completed');
    } catch (error) {
      next(error);
    }
  };

  applyPlanChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { new_plan_id } = req.body;
      
      const usageService = new UsageService(req.context!.prisma);
      const tenantService = new TenantService(req.context!.prisma);

      const tenant = await tenantService.findTenantById(id);
      if (!tenant) {
        return generateResponse(res, 404, {}, false, 'Tenant not found');
      }

      // Apply plan change with usage validation
      await usageService.applyPlanChange(id, new_plan_id);
      
      // Update tenant plan
      const updatedTenant = await tenantService.updateTenant(id, { plan_id: new_plan_id });

      return generateResponse(res, 200, updatedTenant, true, 'Plan changed successfully');
    } catch (error: any) {
      if (error.message.includes('Plan change not allowed')) {
        return generateResponse(res, 400, {}, false, error.message);
      }
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
