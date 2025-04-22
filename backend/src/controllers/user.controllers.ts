import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.services";
import { generateResponse } from "../utils/generateResponse";
import {
  createToken,
  encryptStringCrypt,
  matchPassword,
} from "../middlewares/auth.middleware";
import RoleService from "../services/role.services";

const userService = new UserService();
const roleService = new RoleService();

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
        return generateResponse(res, 400, {}, false, "User not found!");
      }

      const isPasswordValid = await matchPassword(password, user.password);
      if (!isPasswordValid) {
        return generateResponse(res, 400, {}, false, "Invalid password!");
      }

      const role = await roleService.findRoleById(user.role_id);
      const token = createToken(user.id, user.email, role?.name, role?.id);

      generateResponse(
        res,
        200,
        { ...user, token },
        true,
        "Login Successfully!"
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: UserPayload = req.body;

      const user = await userService.findUserByEmail(payload.email);
      if (user) {
        if (user.deleted_at) {
          const hashedPassword = await encryptStringCrypt(payload.password);
          let updatedUser = await userService.updateUser(user.id, {
            email: payload.email,
            name: payload.name,
            role_id: payload.role_id,
            password: hashedPassword,
            deletedAt: null,
          });
          return generateResponse(
            res,
            200,
            updatedUser,
            true,
            "User created successfully!"
          );
        } else {
          return generateResponse(res, 400, {}, false, "User already exists");
        }
      }

      const hashedPassword = await encryptStringCrypt(payload.password);

      const newUser = await userService.createUser({
        email: payload.email,
        password: hashedPassword,
        role_id: payload.role_id,
        created_at: new Date(),
        name: payload.name,
      });

      generateResponse(res, 200, newUser, true, "User created successfully!");
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const payload: UserPayload = req.body;

      const user = await userService.findUserById(userId);
      if (!user) {
        return generateResponse(res, 404, {}, false, "User not found!");
      }

      if (payload.email && payload.email !== user.email) {
        const duplicateUser = await userService.findUserByEmail(payload.email);
        if (duplicateUser) {
          return generateResponse(
            res,
            400,
            {},
            false,
            "Email is already exists!"
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

      generateResponse(res, 200, newUser, true, "User updated successfully!");
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const { oldPassword, newPassword } = req.body;

      const user = await userService.findUserById(userId);
      if (!user) {
        return generateResponse(res, 404, {}, false, "User not found!");
      }

      if (oldPassword) {
        console.log(user.password);

        const isPasswordValid = await matchPassword(oldPassword, user.password);

        if (!isPasswordValid) {
          return generateResponse(res, 400, {}, false, "Invalid old password!");
        }
      }
      let hashPass = user.password;
      if (newPassword) {
        hashPass = await encryptStringCrypt(newPassword);
      }
      const newUser = await userService.changePassword(user.id, hashPass);

      generateResponse(
        res,
        200,
        newUser,
        true,
        "Password updated successfully!"
      );
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
          { email: { contains: search as string, mode: "insensitive" } },
          { name: { contains: search as string, mode: "insensitive" } }
        ];
      }
      console.log({search});
      console.log({filter});
      const users = await userService.findManyUsers(filter);

      generateResponse(
        res,
        200,
        { list: users, count: users.length },
        true,
        "Users fetched successfully!"
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
        generateResponse(res, 404, {}, false, "User not found");
        return;
      }
      generateResponse(res, 200, user, true, "User found");
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
        generateResponse(res, 404, {}, false, "User not found");
        return;
      }

      if (user?.role?.name == "Super Admin") {
        generateResponse(res, 400, {}, true, "You can't delete super admin");
        return;
      }
      await userService.delete(userId);
      generateResponse(res, 200, {}, true, "User deleted successfully");
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
