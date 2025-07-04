import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.services';
import bcrypt from 'bcryptjs';
import { generateResponse } from '../utils/generateResponse';
import RoleService from '../services/role.services';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Actions = 'can_read' | 'can_edit';

declare global {
  namespace Express {
    interface Request {
      candidateInfo?: {
        candidateId: string;
        examId: string;
        name: string;
        email: string;  
      };
    }
  }
}

export const authenticateAndAuthorize =
  (rights?: string, role?: string): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization || '';
    const userService = new UserService();
    const roleService = new RoleService();

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      generateResponse(res, 401, {}, false, 'Authorization token is required.');
      return;
    }


    const token = authHeader.split(' ')[1] || '';
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET as string) as {
        id: string;
        email: string;
        role_id: string;
        role_name: string;
      };

      const user = await userService.findUserById(decoded.id);
      
      if (!user) {
        generateResponse(res, 401, {}, false, 'User not found.');
        return;
      }
      if(user.User_tokens.length == 0){
        throw new Error()
      }

      req.user = decoded;
      if (rights) {
        const [moduleName, action] = rights.split('.');
        if (!moduleName || !action) {
          generateResponse(res, 400, {}, false, 'Invalid rights format.');
          return;
        }
        const permissions = await roleService.getPermissionByRole(decoded.role_id);

        if (!permissions) {
          generateResponse(res, 403, {}, false, 'Permissions not found for the role.');
          return;
        }

        const modulePermission = permissions.find((p:any) => p.module?.name === moduleName);
        if (!modulePermission || !modulePermission[action as Actions]) {
          generateResponse(res, 403, {}, false, 'Request not allowed.');
          return;
        }
      }

      if (role && decoded.role_name !== role) {
        generateResponse(res, 403, {}, false, 'Request not allowed.');
        return;
      }
      next();
    } catch (error) {
      generateResponse(res, 401, {}, false, 'Invalid or expired token.');
    }
  };

// Candidate access code authentication middleware
export const authenticateCandidate: RequestHandler = async (req, res, next) => {
  const code = req.headers['x-access-code'] as string;

  if (!code) {
    generateResponse(res, 404, {}, false, 'Invalid access code');
    return;
  }

  try {
    const candidate = await prisma.candidate.findFirst({
      where: {
        meta: {
          path: ['accessCode'],
          equals: code,
        },
        deleted_at: null,
      },
      include: {
        exam: true,
      },
    });

    if (!candidate || !candidate.exam) {
      generateResponse(res, 404, {}, false, 'Invalid or expired access code');
      return;
    }

    if (
      !candidate.meta ||
      typeof candidate.meta !== 'object' ||
      !('tokenExpiresAt' in candidate.meta)
    ) {
      generateResponse(res, 403, {}, false, 'Invalid access information');
      return;
    }

    const tokenExpiresAt = new Date(candidate.meta.tokenExpiresAt as string);
    const now = new Date();

    if (now > tokenExpiresAt) {
      generateResponse(res, 403, {}, false, 'Access code has expired');
      return;
    }

    req.candidateInfo = {
      candidateId: candidate.id,
      examId: candidate.exam.id,
      name: candidate.name,
      email: candidate.email,
    };

    next();
  } catch (error) {
    console.error('Error verifying candidate access:', error);
    generateResponse(res, 500, {}, false, 'Error verifying exam access');
  }
};

export const createToken = (id: string, email: string, role_name = '', role_id = '') => {
  let payload = {
    id: id,
    email: email,
    role_name: role_name,
    role_id: role_id,
    token: '',
  };

  const token = jwt.sign(payload, process.env.ACCESS_SECRET as string, {
    // expiresIn: process.env.ACCESS_EXPIRES || "30d",
    expiresIn: '7d',
  });
  return token;
};

export const matchPassword = async (password: string, encryptedPassword: string) => {
  let decryptedString = bcrypt.compare(password, encryptedPassword);
  return decryptedString;
};

export const encryptStringCrypt = async (password: string) => {
  let encryptedString = bcrypt.hash(password, 10);
  return encryptedString;
};
