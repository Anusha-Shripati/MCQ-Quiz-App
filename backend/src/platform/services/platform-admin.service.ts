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
                    key: true,
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
                    key: true,
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
}
