import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.services";
import { generateResponse } from "../utils/generateResponse";
import { Role } from "@prisma/client"; // Import the Role enum from Prisma
import { prisma } from "../db/prisma.client";
import {
  createToken,
  encryptStringCrypt,
  matchPassword,
} from "../middlewares/auth.middleware";

const userService = new UserService();

interface UserPayload {
  email: string;
  password: string;
  role: Role;
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
      const token = await createToken(user.id, user.email, user.role);

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

      // Hash the password before saving it to the database
      const hashedPassword = await encryptStringCrypt(payload.password);

      // Create the new user
      const newUser = await userService.createUser({
        email: payload.email,
        password: hashedPassword, // Save the hashed password
        role: payload.role, // Validated role
        createdAt: new Date(),
      });

      generateResponse(res, 201, newUser, true, "User created successfully!");
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

      // Return the filtered users
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
}
