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
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateAdmin(id: string, data: {
    email?: string;
    name?: string;
    role_id?: string;
    is_active?: boolean;
  }) {
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
}
