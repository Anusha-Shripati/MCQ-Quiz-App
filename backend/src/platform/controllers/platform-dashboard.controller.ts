import { Request, Response, NextFunction } from 'express';
import { PlatformDashboardService } from '../services/platform-dashboard.service';
import { generateResponse } from '../../utils/generateResponse';

export class PlatformDashboardController {
  getPlanTenantsData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardService = new PlatformDashboardService(req.context!.prisma);
      const plans = await dashboardService.getPlanTenants();
      return generateResponse(res, 200, plans, true, 'Plan tenant data fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getTenantGrowthData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardService = new PlatformDashboardService(req.context!.prisma);
      const growthData = await dashboardService.getTenantGrowth();
      return res.status(200).json({
        success: true,
        status: 200,
        message: 'Tenant growth data fetched successfully',
        data: growthData,
      });
    } catch (error) {
      next(error);
    }
  };
  // getPlatformUsageData = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const dashboardService = new PlatformDashboardService(req.context!.prisma);
  //     const usageData = await dashboardService.getPlatformUsage();
  //     return res.status(200).json({
  //       success: true,
  //       status: 200,
  //       message: 'Platform usage data fetched successfully',
  //       data: usageData,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
