import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformAdminService } from '../services/platform-admin.service';
import { generateResponse } from '../../utils/generateResponse';
import { matchPassword, encryptStringCrypt } from '../../middlewares/auth.middleware';

export class PlatformAdminController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminByEmail(email);
      
      if (!admin) {
        return generateResponse(res, 400, {}, false, 'Invalid credentials');
      }

      if (!admin.is_active) {
        return generateResponse(res, 400, {}, false, 'Account is inactive');
      }

      const isPasswordValid = await matchPassword(password, admin.password);
      if (!isPasswordValid) {
        return generateResponse(res, 400, {}, false, 'Invalid credentials');
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

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, role_id } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const existingAdmin = await adminService.findAdminByEmail(email);
      if (existingAdmin) {
        return generateResponse(res, 400, {}, false, 'Admin with this email already exists');
      }

      const hashedPassword = await encryptStringCrypt(password);

      const admin = await adminService.createAdmin({
        email,
        password: hashedPassword,
        name,
        role_id,
        created_by: req.user?.id,
      });

      const { password: _, ...adminData } = admin;

      return generateResponse(res, 201, adminData, true, 'Admin created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, is_active } = req.query;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const filter: any = {};
      if (search) filter.search = search as string;
      if (is_active !== undefined) filter.is_active = is_active === 'true';

      const admins = await adminService.findManyAdmins(filter);

      const adminsWithoutPassword = admins.map(({ password, ...admin }) => admin);

      return generateResponse(
        res,
        200,
        { list: adminsWithoutPassword, count: adminsWithoutPassword.length },
        true,
        'Admins retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminById(id);

      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      const { password: _, ...adminData } = admin;

      return generateResponse(res, 200, adminData, true, 'Admin retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { email, name, role_id, is_active } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const existingAdmin = await adminService.findAdminById(id);
      if (!existingAdmin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      if (email && email !== existingAdmin.email) {
        const duplicateAdmin = await adminService.findAdminByEmail(email);
        if (duplicateAdmin) {
          return generateResponse(res, 400, {}, false, 'Admin with this email already exists');
        }
      }

      const updatedAdmin = await adminService.updateAdmin(id, {
        email,
        name,
        role_id,
        is_active,
      });

      const { password: _, ...adminData } = updatedAdmin;

      return generateResponse(res, 200, adminData, true, 'Admin updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminById(id);
      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      if (id === req.user?.id) {
        return generateResponse(res, 400, {}, false, 'Cannot delete your own account');
      }

      await adminService.deleteAdmin(id);

      return generateResponse(res, 200, {}, true, 'Admin deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminById(id);
      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      if (oldPassword) {
        const isPasswordValid = await matchPassword(oldPassword, admin.password);
        if (!isPasswordValid) {
          return generateResponse(res, 400, {}, false, 'Invalid current password');
        }
      }

      const isSamePassword = await matchPassword(newPassword, admin.password);
      if (isSamePassword) {
        return generateResponse(
          res,
          400,
          {},
          false,
          'New password cannot be same as old password, Please choose a different password.'
        );
      }

      const hashedPassword = await encryptStringCrypt(newPassword);
      await adminService.changePassword(id, hashedPassword);

      return generateResponse(res, 200, {}, true, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };

  validateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminByEmail(email);
      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      await adminService.generateAndSendOtp(admin.name, admin.email);
      return generateResponse(res, 200, { email: admin.email }, true, 'Email is valid');
    } catch (error) {
      next(error);
    }
  };

  validateOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminByEmail(email);
      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      try {
        const validOtp = await adminService.validateOtp(email, otp);
        return generateResponse(
          res,
          200,
          { email: admin.email },
          true,
          'OTP is valid. You can reset your password now.'
        );
      } catch (error) {
        return generateResponse(
          res,
          400,
          {},
          false,
          error instanceof Error ? error.message : 'Invalid or expired OTP'
        );
      }
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, newPassword, confirmPassword } = req.body;
      const adminService = new PlatformAdminService(req.context!.prisma);

      const admin = await adminService.findAdminByEmail(email);
      if (!admin) {
        return generateResponse(res, 404, {}, false, 'Admin not found');
      }

      if (newPassword !== confirmPassword) {
        return generateResponse(res, 400, {}, false, 'Passwords do not match');
      }

      const hashedPassword = await encryptStringCrypt(newPassword);
      await adminService.changePassword(admin.id, hashedPassword);

      return generateResponse(res, 200, {}, true, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  };
}
