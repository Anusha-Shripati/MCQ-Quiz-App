import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.services";
import bcrypt from "bcryptjs";
import { generateResponse } from "../utils/generateResponse";
import RoleService from "../services/role.services";


type Actions = 'can_read' | 'can_edit'
export const authenticateAndAuthorize =
  (rights?: string, role?: string): RequestHandler =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const authHeader = req.headers.authorization || "";
      const userService = new UserService();
      const roleService = new RoleService()

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        generateResponse(res, 401, {}, false, "Authorization token is required.");
        return
      }

      const token = authHeader.split(" ")[1] || "";
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_SECRET as string
        ) as {
          id: string;
          email: string;
          role_id: string;
          role_name: string;
        };

        req.user = decoded;
        if (rights) {
          const [moduleName, action] = rights.split('.')
          if (!moduleName || !action) {
            generateResponse(res, 400, {}, false, "Invalid rights format.");
            return
          }
          const permissions = await roleService.getPermissionByRole(decoded.role_id);
          
          if (!permissions) {
            generateResponse(res, 403, {}, false, "Permissions not found for the role.");
            return
          }
          
          const modulePermission = permissions.find((p) => p.module?.name === moduleName);
          if (!modulePermission || !modulePermission[action as Actions]) {
            generateResponse(res, 403, {}, false, "Request not allowed.");
            return
          }
        }
        
        if (role && decoded.role_name !== role) {
          generateResponse(res, 403, {}, false, "Request not allowed.");
          return
        }

        userService
          .findUserById(decoded.id)
          .then((user) => {
            if (!user) {
              return generateResponse(res, 401, {}, false, "User not found.");
            }
            next();
          })
          .catch((error) => {
            generateResponse(res, 500, {}, false, "Error verifying user.");
          });
      } catch (error) {
        generateResponse(res, 500, {}, false, "Invalid or expired token.");
      }
    };

export const createToken = (id: string, email: string, role_name = "",role_id='') => {
  let payload = {
    id: id,
    email: email,
    role_name: role_name,
    role_id: role_id,
    token: "",
  };

  const token = jwt.sign(payload, process.env.ACCESS_SECRET as string, {
    expiresIn: process.env.ACCESS_EXPIRES || "30d",
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
