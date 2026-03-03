import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { TenantRequestService } from '../services/tenant-request.service';
import { TenantService } from '../services/tenant.service';
import { PlanService } from '../services/plan.service';
import { ProvisioningService } from '../services/provisioning.service';
import { generateResponse } from '../../utils/generateResponse';

export class TenantRequestController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organization_name, slug, admin_name, admin_email, admin_password, requested_plan_id } = req.body;
      const service = new TenantRequestService(req.context?.prisma || require('../../db/prisma/client').getPrisma());
      const tenantService = new TenantService(req.context?.prisma || require('../../db/prisma/client').getPrisma());

      // Check if email already exists in requests
      const existingRequest = await service.findByEmail(admin_email);
      if (existingRequest) {
        return generateResponse(res, 400, {}, false, 'A request already exists with this email');
      }

      // Check if tenant already exists with this email
      const existingTenant = await tenantService.findByAdminEmail(admin_email);
      if (existingTenant) {
        return generateResponse(res, 400, {}, false, 'An organization already exists with this email');
      }

      // Check slug uniqueness
      const slugExists = await service.checkSlugExists(slug);
      if (slugExists) {
        return generateResponse(res, 400, {}, false, 'Organization name is already taken');
      }

      // Hash password and create request
      const hashedPassword = await bcrypt.hash(admin_password, 10);
      const request = await service.createRequest({
        organization_name,
        slug,
        admin_name,
        admin_email,
        admin_password: hashedPassword,
        requested_plan_id
      });

      return generateResponse(res, 201, request, true, 'Request submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  checkSlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.body;
      const service = new TenantRequestService(req.context?.prisma || require('../../db/prisma/client').getPrisma());

      const exists = await service.checkSlugExists(slug);
      return generateResponse(res, 200, { available: !exists }, true);
    } catch (error) {
      next(error);
    }
  };

  checkOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.body;
      const service = new TenantRequestService(req.context?.prisma || require('../../db/prisma/client').getPrisma());

      const result = await service.checkOrganizationStatus(slug);
      return generateResponse(res, 200, result, true);
    } catch (error) {
      next(error);
    }
  };

  checkStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { admin_email, admin_password } = req.body;
      const service = new TenantRequestService(req.context?.prisma || require('../../db/prisma/client').getPrisma());

      const request = await service.findByEmail(admin_email);
      if (!request) {
        return generateResponse(res, 404, {}, false, 'No request found with this email');
      }

      const isValidPassword = await bcrypt.compare(admin_password, request.admin_password);
      if (!isValidPassword) {
        return generateResponse(res, 400, {}, false, 'Invalid credentials');
      }

      return generateResponse(res, 200, {
        status: request.status,
        organization_name: request.organization_name,
        slug: request.slug,
        rejection_reason: request.rejection_reason,
        tenant_id: request.tenant_id
      }, true);
    } catch (error) {
      next(error);
    }
  };

  cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { admin_email, admin_password } = req.body;
      const service = new TenantRequestService(req.context!.prisma);

      const request = await service.findByEmail(admin_email);
      if (!request) {
        return generateResponse(res, 404, {}, false, 'No request found with this email');
      }

      if (request.status === 'processing') {
        return generateResponse(res, 400, {}, false, 'Cannot cancel request while it is being processed');
      }

      if (request.status !== 'pending') {
        return generateResponse(res, 400, {}, false, 'Only pending requests can be cancelled');
      }

      const isValidPassword = await bcrypt.compare(admin_password, request.admin_password);
      if (!isValidPassword) {
        return generateResponse(res, 400, {}, false, 'Invalid credentials');
      }

      await service.deleteRequest(request.id);
      return generateResponse(res, 200, {}, true, 'Request cancelled successfully');
    } catch (error) {
      next(error);
    }
  };

  // Admin endpoints
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search, page = '1', limit = '10' } = req.query;
      const service = new TenantRequestService(req.context!.prisma);

      const filter = {
        status: status as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const { requests, total } = await service.findManyRequests(filter);

      return generateResponse(
        res,
        200,
        { list: requests, count: requests.length, total },
        true,
        'Tenant requests retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const service = new TenantRequestService(req.context!.prisma);
      const planService = new PlanService(req.context!.prisma);
      const provisioningService = new ProvisioningService(req.context!.prisma);

      const request = await service.findById(id);
      if (!request) {
        return generateResponse(res, 404, {}, false, 'Request not found');
      }

      if (request.status !== 'pending') {
        const statusMessages = {
          processing: 'Request is already being processed',
          approved: 'Request has already been approved',
          rejected: 'Request has been rejected'
        };
        return generateResponse(res, 400, {}, false, statusMessages[request.status as keyof typeof statusMessages] || 'Request cannot be processed');
      }

      // Set status to processing to prevent duplicate attempts
      await service.updateRequest(id, {
        status: 'processing',
        reviewed_by: adminId,
        reviewed_at: new Date()
      });

      try {
        // Get plan ID - use requested plan or find default free plan
        let planId = request.requested_plan_id;
        if (!planId) {
          const { plans } = await planService.findManyPlans({ is_active: true });
          const freePlan = plans.find(p => p.name.toLowerCase().includes('free'));
          planId = freePlan?.id || plans[0]?.id;
          
          if (!planId) {
            // Rollback to pending if no plans available
            await service.updateRequest(id, { status: 'pending' });
            return generateResponse(res, 400, {}, false, 'No active plans available');
          }
        }

        // Start provisioning process
        const result = await provisioningService.provisionTenant({
          name: request.organization_name,
          slug: request.slug,
          plan_id: planId,
          admin_email: request.admin_email,
          admin_name: request.admin_name,
          admin_password: request.admin_password,
          created_by: adminId
        });

        // Update request status to approved
        await service.updateRequest(id, {
          status: 'approved',
          tenant_id: result.tenant.id
        });

        return generateResponse(res, 200, result, true, 'Request approved and tenant provisioned');
      } catch (provisioningError: any) {
        // Rollback to pending if provisioning fails
        await service.updateRequest(id, {
          status: 'pending',
          reviewed_by: null,
          reviewed_at: null
        });
        
        console.error('Provisioning failed:', provisioningError.message);
        return generateResponse(res, 500, {}, false, `Provisioning failed: ${provisioningError.message}`);
      }
    } catch (error) {
      next(error);
    }
  };

  rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.id;
      const service = new TenantRequestService(req.context!.prisma);

      const request = await service.findById(id);
      if (!request) {
        return generateResponse(res, 404, {}, false, 'Request not found');
      }

      if (request.status === 'processing') {
        return generateResponse(res, 400, {}, false, 'Cannot reject request while it is being processed');
      }

      if (request.status !== 'pending') {
        const statusMessages = {
          approved: 'Request has already been approved',
          rejected: 'Request has already been rejected'
        };
        return generateResponse(res, 400, {}, false, statusMessages[request.status as keyof typeof statusMessages] || 'Request cannot be rejected');
      }

      await service.updateRequest(id, {
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date()
      });

      return generateResponse(res, 200, {}, true, 'Request rejected successfully');
    } catch (error) {
      next(error);
    }
  };
}