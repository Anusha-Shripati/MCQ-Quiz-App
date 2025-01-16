import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.services";
import bcrypt from "bcryptjs";
import { generateResponse } from "../utils/generateResponse";

export const authenticateAndAuthorize =
  (allowedRoles: string[] = []): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization || "";
    const userService = new UserService();

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      generateResponse(res, 401, {}, false, "Authorization token is required.");
    }

    const token = authHeader.split(" ")[1] || "";
    try {
      // Decode and verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        email: string;
        role: string;
      };

      // Attach the user information to the request object
      req.user = decoded;

      // Check if the user's role is allowed (if roles are specified)
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        generateResponse(res, 403, {}, false, "Request not allowed.");
      }

      // Verify the user exists in the database
      userService
        .findUserById(decoded.id)
        .then((user) => {
          if (!user) {
            return generateResponse(res, 404, {}, false, "User not found.");
          }
          next(); // Proceed to the next middleware
        })
        .catch((error) => {
          generateResponse(res, 500, {}, false, "Error verifying user.");
        });
    } catch (error) {
      generateResponse(res, 500, {}, false, "Invalid or expired token.");
    }
  };

export const createToken = (id: string, email: string, role = "user") => {
  let payload = {
    id: id,
    email: email,
    role: role,
    token: "",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.EXPIRE_JWT_SECRET || "30d",
  });

  return token;
};

export const matchPassword = async (
  password: string,
  encryptedPassword: string
) => {
  let decryptedString = bcrypt.compare(password, encryptedPassword);
  return decryptedString;
};

export const encryptStringCrypt = async (password: string) => {
  let encryptedString = bcrypt.hash(password, 10);
  return encryptedString;
};
