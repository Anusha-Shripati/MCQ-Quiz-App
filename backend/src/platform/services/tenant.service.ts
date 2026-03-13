import { PrismaClient } from '../../db/prisma/generated/client';
import { DatabaseUtils } from '../utils/database.utils';

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
    subscription_starts_at?: Date;
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
    page?: number;
    limit?: number;
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

    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.prisma.tenants.findMany({
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
        skip,
        take: limit,
      }),
      this.prisma.tenants.count({ where }),
    ]);

    return { tenants, total };
  }

  async updateTenant(
    id: string,
    data: {
      name?: string;
      slug?: string;
      plan_id?: string;
      admin_email?: string;
      admin_name?: string;
    }
  ) {
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

  async hardDeleteTenant(id: string) {
    const tenant = await this.findTenantById(id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    console.log(`[Tenant Service] Starting hard delete for tenant: ${tenant.slug}`);

    try {
      // Delete usage records
      console.log(`[Tenant Service] Deleting usage records`);
      await this.prisma.tenant_usage.deleteMany({ where: { tenant_id: id } });

      // Delete tenant record
      console.log(`[Tenant Service] Deleting tenant record`);
      await this.prisma.tenants.delete({ where: { id } });

      // Drop database
      if (tenant.db_name) {
        console.log(`[Tenant Service] Dropping database: ${tenant.db_name}`);
        await DatabaseUtils.dropDatabase(tenant.db_name);
      }

      console.log(`[Tenant Service] ✅ Hard delete completed for tenant: ${tenant.slug}`);
      return { success: true, message: 'Tenant and database deleted successfully' };
    } catch (error: any) {
      console.error(`[Tenant Service] ❌ Error during hard delete:`, error.message);
      throw new Error(`Failed to delete tenant: ${error.message}`);
    }
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

  async updateSubscription(
    id: string,
    data: {
      subscription_starts_at?: Date;
      subscription_ends_at?: Date;
    }
  ) {
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

  async findByAdminEmail(admin_email: string) {
    return await this.prisma.tenants.findFirst({
      where: { admin_email, deleted_at: null },
      include: { plan: true }
    });
  }
}
