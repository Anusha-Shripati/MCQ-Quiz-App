import { Request, Response, NextFunction } from 'express';
import { ProvisioningService } from '../services/provisioning.service';
import { generateResponse } from '../../utils/generateResponse';

export class ProvisioningController {
  provision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, plan_id, admin_email, admin_name, admin_password } = req.body;
      
      const provisioningService = new ProvisioningService(req.context!.prisma);

      const result = await provisioningService.provisionTenant({
        name,
        slug,
        plan_id,
        admin_email,
        admin_name,
        admin_password,
        created_by: req.user?.id,
      });

      return generateResponse(
        res,
        201,
        result,
        true,
        'Tenant provisioned successfully'
      );
    } catch (error: any) {
      return generateResponse(
        res,
        400,
        {},
        false,
        error.message || 'Failed to provision tenant'
      );
    }
  };
}
