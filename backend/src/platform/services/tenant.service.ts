import { PrismaClient } from '../../db/prisma/generated/client';

export class TenantService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createTenant(data: {
    name: string;
    slug: string;
    plan_id: string;
    db_name: string;
    db_url: string;
    admin_email: string;
    admin_name: string;
    status?: string;
    trial_ends_at?: Date;
    subscription_ends_at?: Date;
    created_by?: string;
  }) {
    return await this.prisma.tenants.create({
      data: {
        ...data,
        status: (data.status as any) || 'trial',
      },
      include: {
        plan: true,
      },
    });
  }

  async findTenantById(id: string) {
    return await this.prisma.tenants.findUnique({
      where: { id, deleted_at: null },
      include: {
        plan: true,
        usage: true,
        _count: {
          select: { usage: true },
        },
      },
    });
  }

  async findTenantBySlug(slug: string) {
    return await this.prisma.tenants.findUnique({
      where: { slug, deleted_at: null },
      include: {
        plan: true,
      },
    });
  }

  async findManyTenants(filter?: {
    status?: string;
    plan_id?: string;
    search?: string;
  }) {
    const where: any = { deleted_at: null };

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.plan_id) {
      where.plan_id = filter.plan_id;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { slug: { contains: filter.search, mode: 'insensitive' } },
        { admin_email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.tenants.findMany({
      where,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateTenant(id: string, data: {
    name?: string;
    slug?: string;
    plan_id?: string;
    admin_email?: string;
    admin_name?: string;
  }) {
    return await this.prisma.tenants.update({
      where: { id },
      data,
      include: {
        plan: true,
      },
    });
  }

  async deleteTenant(id: string) {
    return await this.prisma.tenants.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async updateStatus(id: string, status: string) {
    return await this.prisma.tenants.update({
      where: { id },
      data: { status: status as any },
      include: {
        plan: true,
      },
    });
  }

  async updateSubscription(id: string, data: {
    trial_ends_at?: Date;
    subscription_ends_at?: Date;
  }) {
    return await this.prisma.tenants.update({
      where: { id },
      data,
      include: {
        plan: true,
      },
    });
  }

  async getTenantUsage(id: string) {
    return await this.prisma.tenant_usage.findMany({
      where: { tenant_id: id },
      orderBy: { metric_type: 'asc' },
    });
  }
}
