import { Roles, User } from '@prisma/client'; // Import Role if needed
import { prisma } from '../db/prisma.client';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';
import { CacheService } from './cacheService';
import { sendAccountDeletedEmail } from '../utils/email.utils';

export class UserService {
  private cacheService;
  private cacheTime = 60;

  constructor() {
    this.cacheService = new CacheService();
  }

  async createUser(
    data: Pick<User, 'email' | 'password' | 'created_at' | 'role_id' | 'name' |'created_by'>
  ): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role_id: data.role_id,
        created_at: data.created_at,
        name: data.name,
        created_by:data.created_by
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const data = await this.cacheService.getKey(`user:email:${email}`);
    if (data) return JSON.parse(data);

    const response = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            role_permissions: {
              select: {
                can_read: true,
                can_edit: true,
                module: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    await this.cacheService.setKey(`user:email:${email}}`, response, this.cacheTime);
    return response;
  }
  async findUserByEmailForUpdate(email: string): Promise<User | null> {
    const data = await this.cacheService.getKey(`user:email:${email}`);
    if (data) return JSON.parse(data);

    const response = await prisma.user.findUnique({
      where: { email, deleted_at: null },
      include: {
        role: {
          include: {
            role_permissions: {
              select: {
                can_read: true,
                can_edit: true,
                module: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    await this.cacheService.setKey(`user:email:${email}}`, response, this.cacheTime);
    return response;
  }

  async findUserById(userId: string){
    const data = await this.cacheService.getKey(`user:${userId}`);

    if (data) return JSON.parse(data);
    const response = await prisma.user.findUnique({
      where: { id: userId, deleted_at: null },
      include: {
        User_tokens:true,
        role: {
          include: {
            role_permissions: {
              select: {
                can_read: true,
                can_edit: true,
                module: {
                  select: {
                    name: true,
                  },
                },
              },
            },

          },
        },
      },
    });
    await this.cacheService.setKey(`user:${userId}`, response, this.cacheTime);
    return response;
  }

  async updateUser(id: string, data: Record<string, any>) {
    const { role_id, deletedAt, created_by, ...restData } = data;
    const updateData: any = { ...restData };
    if (role_id) {
      updateData.role = {
        connect: { id: role_id },
      };
    }
    if (deletedAt !== undefined) {
      updateData.deleted_at = deletedAt;
    }
    if (created_by) {
      updateData.created_by_user = { connect: { id: created_by } };
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include:{
          role:true
        }
      });

      if (!user) return null;
      const { password, token, ...rest } = user;
      return rest;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user. This could be due to a unique constraint violation.');
    }
  }

  async changePassword(id: string, password: string) {
    const user = await prisma.user.update({ where: { id }, data: { password } });
    if (!user) return null;
    const { password: _, token, ...rest } = user;
    return rest;
  }
  async findManyUsers(
    filter: Record<string, any>
  ): Promise<Pick<User, 'id' | 'email' | 'role_id'>[]> {
    const key = this.cacheService.generateKey('user:filter', filter);
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);
    const response = await prisma.user.findMany({
      where: {
        ...filter,
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role_id: true,
        created_at: true,
        deleted_at: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        created_by_user:{
          select:{
            name:true,
            deleted_at:true
          }
        },
      },
      orderBy:{
        created_at:'desc'
      }
    });
    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  }
  async delete(id: string) {
    const user = await prisma.user.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });
    await sendAccountDeletedEmail(user.name,user.email)
    return user
  }
  async generateAndSendOtp(name: string, email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = dayjs().add(10, 'minute').toDate();
    await prisma.reset_password.deleteMany({ where: { email } });

    await prisma.reset_password.create({
      data: {
        email,
        otp,
        expires_at: expiresAt,
      },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP for Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name}</p>
          <p>You requested to reset your password. Use the OTP below:</p>
          <h3 style="color: #333;">${otp}</h3>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, you can ignore this email.</p>
          <br/>
          <p>Thanks,</p>
          <p>LR Dev Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  }
  async validateOtp(email: string, otp: string) {
    const resetPassword = await prisma.reset_password.findFirst({
      where: { email, otp, expires_at: { gte: new Date() } },
    });

    if (!resetPassword) {
      throw new Error('Invalid or expired OTP');
    }

    return resetPassword;
  }
  async findSoftDeletedUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        email,
        deleted_at: { not: null },
      },
    });
  }
}
