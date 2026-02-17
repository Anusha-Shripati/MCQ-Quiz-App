import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformAdminService } from '../services/platform-admin.service';
import { generateResponse } from '../../utils/generateResponse';

type Actions = 'can_read' | 'can_edit';

export const platformAuth =
  (rights?: string): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      generateResponse(res, 401, {}, false, 'Authorization token is required');
      return;
    }

    const token = authHeader.split(' ')[1] || '';

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET as string) as {
        id: string;
        email: string;
        role_id: string;
        role_name: string;
        token_type: string;
      };

      if (decoded.token_type !== 'PLATFORM_ADMIN') {
        generateResponse(res, 403, {}, false, 'Invalid token type');
        return;
      }

      const adminService = new PlatformAdminService(req.context!.prisma);
      const admin = await adminService.findAdminById(decoded.id);

      if (!admin) {
        generateResponse(res, 401, {}, false, 'Admin not found');
        return;
      }

      if (!admin.is_active) {
        generateResponse(res, 403, {}, false, 'Account is inactive');
        return;
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
        token_type: 'PLATFORM_ADMIN',
      };

      if (rights) {
        const [moduleName, action] = rights.split('.');
        
        if (!moduleName || !action) {
          generateResponse(res, 400, {}, false, 'Invalid rights format');
          return;
        }

        if (!admin.role || !admin.role.role_permissions) {
          generateResponse(res, 403, {}, false, 'No permissions assigned');
          return;
        }

        const modulePermission = admin.role.role_permissions.find(
          (p: any) => p.module?.name === moduleName
        );

        if (!modulePermission || !modulePermission[action as Actions]) {
          generateResponse(res, 403, {}, false, 'Insufficient permissions');
          return;
        }
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        generateResponse(res, 401, {}, false, 'Invalid token');
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        generateResponse(res, 401, {}, false, 'Token expired');
        return;
      }
      generateResponse(res, 500, {}, false, 'Authentication error');
    }
  };
