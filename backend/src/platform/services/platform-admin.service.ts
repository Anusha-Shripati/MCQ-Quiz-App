import { PrismaClient } from '../../db/prisma/generated/client';

export class PlatformAdminService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAdminByEmail(email: string) {
    return await this.prisma.platform_admins.findUnique({
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
  }

  async findAdminById(id: string) {
    return await this.prisma.platform_admins.findUnique({
      where: { id, deleted_at: null },
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
  }

  async updateLastLogin(id: string) {
    return await this.prisma.platform_admins.update({
      where: { id },
      data: { last_login: new Date() },
    });
  }

  async createAdmin(data: {
    email: string;
    password: string;
    name: string;
    role_id: string;
    created_by?: string;
  }) {
    return await this.prisma.platform_admins.create({
      data: {
        ...data,
        is_active: true,
      },
      include: {
        role: true,
      },
    });
  }

  async findManyAdmins(filter?: { search?: string; is_active?: boolean }) {
    const where: any = { deleted_at: null };

    if (filter?.is_active !== undefined) {
      where.is_active = filter.is_active;
    }

    if (filter?.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { name: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.platform_admins.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        created_by_admin: {
          select: {
            name: true,
            deleted_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateAdmin(
    id: string,
    data: {
      email?: string;
      name?: string;
      role_id?: string;
      is_active?: boolean;
      image?: string;
    }
  ) {
    return await this.prisma.platform_admins.update({
      where: { id },
      data,
      include: {
        role: true,
      },
    });
  }

  async deleteAdmin(id: string) {
    return await this.prisma.platform_admins.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async changePassword(id: string, password: string) {
    return await this.prisma.platform_admins.update({
      where: { id },
      data: { password },
    });
  }

  async generateAndSendOtp(name: string, email: string) {
    const nodemailer = require('nodemailer');
    const dayjs = require('dayjs');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(10, 'minute').toDate();

    // Delete any existing OTPs for this email
    await this.prisma.platform_reset_password.deleteMany({ where: { email } });

    // Store OTP in platform_reset_password table
    await this.prisma.platform_reset_password.create({
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
      subject: 'Your OTP for Password Reset - Platform Admin',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name}</p>
          <p>You requested to reset your platform admin password. Use the OTP below:</p>
          <h3 style="color: #333;">${otp}</h3>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, you can ignore this email.</p>
          <br/>
          <p>Thanks,</p>
          <p>Platform Admin Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  }

  async validateOtp(email: string, otp: string) {
    const resetPassword = await this.prisma.platform_reset_password.findFirst({
      where: { email, otp, expires_at: { gte: new Date() } },
    });

    if (!resetPassword) {
      throw new Error('Invalid or expired OTP');
    }

    return resetPassword;
  }

  async findSoftDeletedAdminByEmail(email: string) {
    return await this.prisma.platform_admins.findFirst({
      where: {
        email,
        deleted_at: { not: null },
      },
    });
  }
}
