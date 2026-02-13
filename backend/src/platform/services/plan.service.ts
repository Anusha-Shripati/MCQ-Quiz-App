import { PrismaClient } from '../../db/prisma/generated/client';

export class PlanService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createPlan(data: {
    name: string;
    description?: string;
    price: number;
    limits: any;
    features: any;
    created_by?: string;
  }) {
    return await this.prisma.plans.create({
      data: {
        ...data,
        is_active: true,
      },
    });
  }

  async findPlanById(id: string) {
    return await this.prisma.plans.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tenants: true },
        },
      },
    });
  }

  async findManyPlans(filter?: { is_active?: boolean; search?: string }) {
    const where: any = {};

    if (filter?.is_active !== undefined) {
      where.is_active = filter.is_active;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.plans.findMany({
      where,
      include: {
        _count: {
          select: { tenants: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updatePlan(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    limits?: any;
    features?: any;
  }) {
    return await this.prisma.plans.update({
      where: { id },
      data,
    });
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.plans.findUnique({
      where: { id },
      include: {
        tenants: {
          where: { deleted_at: null },
        },
      },
    });

    if (plan && plan.tenants.length > 0) {
      throw new Error('Cannot delete plan with active tenants');
    }

    return await this.prisma.plans.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const plan = await this.prisma.plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    return await this.prisma.plans.update({
      where: { id },
      data: { is_active: !plan.is_active },
    });
  }

  async getPlanTenants(id: string) {
    return await this.prisma.tenants.findMany({
      where: {
        plan_id: id,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
