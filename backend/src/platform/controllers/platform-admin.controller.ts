import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformAdminService } from '../services/platform-admin.service';
import { generateResponse } from '../../utils/generateResponse';
import { matchPassword } from '../../middlewares/auth.middleware';

export class PlatformAdminController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Login request received with body:', req.body);
    try {
      const { email, password } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminByEmail(email);
      
      if (!admin) {
        return generateResponse(res, 401, {}, false, 'Invalid credentials');
      }

      if (!admin.is_active) {
        return generateResponse(res, 403, {}, false, 'Account is inactive');
      }

      const isPasswordValid = await matchPassword(password, admin.password);
      if (!isPasswordValid) {
        return generateResponse(res, 401, {}, false, 'Invalid credentials');
      }

      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role_id: admin.role_id,
          role_name: admin.role?.name || '',
          token_type: 'PLATFORM_ADMIN',
        },
        process.env.ACCESS_SECRET as string,
        { expiresIn: '7d' }
      );

      await adminService.updateLastLogin(admin.id);

      const { password: _, ...adminData } = admin;

      return generateResponse(
        res,
        200,
        { ...adminData, token },
        true,
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return generateResponse(res, 200, {}, true, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminService = new PlatformAdminService(req.context!.prisma);
      const admin = await adminService.findAdminById(req.user!.id);

      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      const { password: _, ...adminData } = admin;

      return generateResponse(res, 200, adminData, true, 'Admin profile retrieved');
    } catch (error) {
      next(error);
    }
  };
}
