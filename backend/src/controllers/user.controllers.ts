import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.services';
import { generateResponse } from '../utils/generateResponse';
import { createToken, encryptStringCrypt, matchPassword } from '../middlewares/auth.middleware';
import RoleService from '../services/role.services';
import { UploadService } from '../services/upload.services';
import { sendAccountUpdateEmail, sendWelcomeEmail } from '../utils/email.utils';

const userService = new UserService();
const roleService = new RoleService();
const uploadService = new UploadService();
interface UserPayload {
  email: string;
  password: string;
  role_id: string;
  name: string;
}

export class UserController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await userService.findUserByEmail(email);
      if (!user) {
        return generateResponse(res, 400, {}, false, 'User not found!');
      }

      const isPasswordValid = await matchPassword(password, user.password);
      if (!isPasswordValid) {
        return generateResponse(res, 400, {}, false, 'Invalid password!');
      }
      if (user.deleted_at) {
        return generateResponse(res, 400, {}, false, 'User is deleted!');
      }
      if (!user.role_id) {
        return generateResponse(res, 400, {}, false, 'User is not found!');
      }
      const role = await roleService.findRoleById(user.role_id);
      const token = createToken(user.id, user.email, role?.name, role?.id);

      generateResponse(res, 200, { ...user, token }, true, 'Login Successfully!');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: UserPayload = req.body;
      const user = await userService.findUserByEmail(payload.email);
      const hashedPassword = await encryptStringCrypt(payload.password);
      if (user) {
        if (user.deleted_at) {
          try {
            const updatedUser = await userService.updateUser(user.id, {
              email: payload.email,
              name: payload.name,
              role_id: payload.role_id,
              password: hashedPassword,
              deleted_at: null,
              created_by:req.user?.id
            });
            // Send welcome back email
            await sendWelcomeEmail(payload.name, payload.email, payload.password);
            return generateResponse(res, 200, updatedUser, true, 'User restored successfully!');
          } catch (error) {
            console.error('Error restoring user:', error);
            return generateResponse(
              res,
              500,
              {},
              false,
              'Failed to restore user. Please try again.'
            );
          }
        } else {
          return generateResponse(res, 400, {}, false, 'Email already exists.');
        }
      }

      const newUser = await userService.createUser({
        email: payload.email,
        password: hashedPassword,
        role_id: payload.role_id,
        created_at: new Date(),
        name: payload.name,
        created_by:req.user?.id
      });
      const role = newUser.role_id ? await roleService.findRoleById(newUser.role_id) : null;
      await sendWelcomeEmail(payload.name, payload.email, payload.password, role?.name);

      return generateResponse(res, 200, newUser, true, 'User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const payload: UserPayload = req.body;

      const user = await userService.findUserById(userId);
      if (!user) {
        return generateResponse(res, 404, {}, false, 'User not found!');
      }

      if (payload.email && payload.email !== user.email) {
        const duplicateUser = await userService.findUserByEmailForUpdate(payload.email);
        if (duplicateUser) {
          return generateResponse(res, 400, {}, false, 'Email already exists!');
        }

        const softDeletedUser = await userService.findSoftDeletedUserByEmail(payload.email);
        if (softDeletedUser) {
          let hashPass = user.password;
          if (payload.password) {
            hashPass = await encryptStringCrypt(payload.password);
          }

          await userService.updateUser(softDeletedUser.id, {
            email: payload.email,
            name: payload.name || user.name,
            role_id: payload.role_id || user.role_id,
            password: hashPass,
            deleted_at: null,
          });

          await userService.delete(userId);
          
          return generateResponse(
            res,
            200,
            { ...softDeletedUser, deleted_at: null },
            true,
            'User updated and restored successfully!'
          );
        }
      }

      let hashPass = user.password;
      if (payload.password) {
        hashPass = await encryptStringCrypt(payload.password);
      }

      const newUser = await userService.updateUser(user.id, {
        email: payload.email,
        name: payload.name,
        role_id: payload.role_id,
        password: hashPass,
      });
      
      await sendAccountUpdateEmail(payload.name, payload.email, payload.password, newUser?.role?.name);

      generateResponse(res, 200, newUser, true, 'User updated successfully!');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const { oldPassword, newPassword } = req.body;
      let isPasswordValid;

      const user = await userService.findUserById(userId);
      if (!user) {
        return generateResponse(res, 404, {}, false, 'User not found!');
      }

      if (oldPassword) {
        isPasswordValid = await matchPassword(oldPassword, user.password);

        if (!isPasswordValid) {
          return generateResponse(res, 400, {}, false, 'Invalid old password!');
        }
      }
      let hashPass = user.password;
      if (newPassword) {
        const isSamePassword = await matchPassword(newPassword, user.password);
        if (isSamePassword) {
          return generateResponse(
            res,
            400,
            {},
            false,
            'New password cannot be same as old password, Please choose a different password.'
          );
        }
        hashPass = await encryptStringCrypt(newPassword);
      }

      const newUser = await userService.changePassword(user.id, hashPass);

      generateResponse(res, 200, newUser, true, 'Password updated successfully!');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;

      const filter: any = {};

      if (search) {
        filter.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { name: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      const users = await userService.findManyUsers(filter);

      generateResponse(
        res,
        200,
        { list: users, count: users.length },
        true,
        'Users fetched successfully!'
      );
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const user = await userService.findUserById(userId);
      if (!user) {
        generateResponse(res, 404, {}, false, 'User not found');
        return;
      }
      generateResponse(res, 200, user, true, 'User found');
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;

      const user = await userService.findUserById(userId);
      if (!user) {
        generateResponse(res, 404, {}, false, 'User not found');
        return;
      }

      if (user?.role?.name == 'Super Admin') {
        generateResponse(res, 400, {}, true, "You can't delete super admin");
        return;
      }
      await userService.delete(userId);
      generateResponse(res, 200, {}, true, 'User deleted successfully');
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const user = await userService.findUserById(userId);
      if (!user) {
        generateResponse(res, 404, {}, false, 'User not found');
        return;
      }
      if (!req.file) {
        generateResponse(res, 400, {}, false, 'No file uploaded');
        return;
      }
      const fileData = await uploadService.processFile(req.file);
      await userService.updateUser(userId, {
        image: fileData.path,
      });

      generateResponse(res, 200, fileData, true, 'Image uploaded successfully');
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  validateEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    try {
      const user = await userService.findUserByEmail(email);
      if (!user) {
        generateResponse(res, 404, {}, false, 'User not found');
        return;
      } else {
        await userService.generateAndSendOtp(user.name, user.email);
        generateResponse(res, 200, { email: user.email }, true, 'Email is valid');
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  validateOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    try {
      const user = await userService.findUserByEmail(email);
      if (!user) {
        generateResponse(res, 404, {}, false, 'User not found');
        return;
      }

      try {
        const validOtp = await userService.validateOtp(email, otp);
        generateResponse(
          res,
          200,
          { email: user.email },
          true,
          'OTP is valid. You can reset your password now.'
        );
      } catch (error) {
        generateResponse(
          res,
          400,
          '',
          false,
          typeof error === 'string' ? error : 'Invalid or expired OTP. Please try again.'
        );
        return;
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword, confirmPassword } = req.body;
    try {
      const user = await userService.findUserByEmail(email);
      if (!user) {
        generateResponse(res, 404, {}, false, 'User not found');
        return;
      }
      if (newPassword !== confirmPassword) {
        generateResponse(res, 400, {}, false, 'Passwords do not match');
        return;
      }
      const hashedPassword = await encryptStringCrypt(newPassword);
      await userService.updateUser(user.id, { password: hashedPassword });
      generateResponse(res, 200, {}, true, 'Password reset successfully');
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
