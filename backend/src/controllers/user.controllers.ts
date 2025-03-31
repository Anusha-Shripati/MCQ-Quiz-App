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
}

export class UserController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;



      // Step 1: Find the user by email
      const user = await userService.findUserByEmail(email);
      if (!user) {
        return generateResponse(res, 401, {}, false, "User not found!");
      }

      // Step 2: Compare passwords
      const isPasswordValid = await matchPassword(password, user.password);
      if (!isPasswordValid) {
        return generateResponse(res, 401, {}, false, "Invalid password!");
      }

      // Step 3: Generate JWT token
      const role = await roleService.findRoleById(user.role_id);
      const token = createToken(user.id, user.email, role?.name || '');

      // Step 4: Respond with the token
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
        return generateResponse(res, 401, {}, false, "User already exists");
      }

      const hashedPassword = await encryptStringCrypt(payload.password);

      const newUser = await userService.createUser({
        email: payload.email,
        password: hashedPassword,
        role_id: payload.role_id,
        createdAt: new Date(),
      });

      generateResponse(res, 200, newUser, true, "User created successfully!");
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id
      const payload: UserPayload = req.body;

      const user = await userService.findUserById(userId);
      if (!user) {
        return generateResponse(res, 404, {}, false, "User not found!");
      }

      if (payload.email && payload.email !== user.email) {
        const duplicateUser = await userService.findUserByEmail(user.email);
        if (duplicateUser) {
          return generateResponse(res, 400, {}, false, "Email is already exists!");
        }
      }

      const hashedPassword = await encryptStringCrypt(payload.password);

      const newUser = await userService.updateUser(user.id,{
        email: payload.email,
        password: hashedPassword,
        role_id: payload.role_id,
      });

      generateResponse(res, 200, newUser, true, "User updated successfully!");
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the query parameters
      const { role, email } = req.query;

      // Build the filter object based on query params
      const filter: any = req.query;

      // Add filters for role, email,
      if (role) {
        if (!["Editor", "Candidate"].includes(role as string)) {
          generateResponse(
            res,
            400,
            {},
            false,
            "Invalid role. Only 'Editor' or 'Candidate' are allowed.!"
          );
        }
        filter.role = role;
      }

      if (email) {
        filter.email = { contains: email as string, mode: "insensitive" };
      }

      const users = await userService.findManyUsers({ email: email });

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
      await userService.delete(userId)
      generateResponse(res, 200, {}, true, "User deleted successfully");
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
