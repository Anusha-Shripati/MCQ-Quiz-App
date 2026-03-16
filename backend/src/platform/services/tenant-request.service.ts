import { PrismaClient } from '../../db/prisma/generated/client';

interface CreateTenantRequestData {
  organization_name: string;
  slug: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  requested_plan_id?: string;
}

interface RequestFilter {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

export class TenantRequestService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createRequest(data: CreateTenantRequestData) {
    return await this.prisma.tenant_requests.create({
      data,
      include: { requested_plan: true }
    });
  }

  async findByEmail(admin_email: string) {
    return await this.prisma.tenant_requests.findUnique({
      where: { admin_email },
      include: { requested_plan: true }
    });
  }

  async findById(id: string) {
    return await this.prisma.tenant_requests.findUnique({
      where: { id },
      include: { requested_plan: true }
    });
  }

  async checkSlugExists(slug: string) {
    const [requestExists, tenantExists] = await Promise.all([
      this.prisma.tenant_requests.findUnique({ where: { slug } }),
      this.prisma.tenants.findUnique({ where: { slug, deleted_at: null } })
    ]);
    
    return !!(requestExists || tenantExists);
  }

  async checkOrganizationStatus(slug: string) {
    // First check if tenant exists
    const tenant = await this.prisma.tenants.findUnique({
      where: { slug, deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true
      }
    });

    if (tenant) {
      return {
        tenant: {
          exists: true,
          slug: tenant.slug,
          status: tenant.status,
          name: tenant.name
        },
        request: null
      };
    }

    // If tenant doesn't exist, check for request
    const request = await this.prisma.tenant_requests.findUnique({
      where: { slug },
      select: {
        status: true,
        organization_name: true,
        created_at: true
      }
    });

    const statusMessages = {
      pending: 'Your request is being reviewed by our team',
      processing: 'Your request is currently being processed',
      approved: 'Your request has been approved and organization is being set up',
      rejected: 'Your request has been rejected'
    };

    return {
      tenant: {
        exists: false
      },
      request: request ? {
        status: request.status,
        organization_name: request.organization_name,
        message: statusMessages[request.status as keyof typeof statusMessages] || 'Request found'
      } : null
    };
  }

  async deleteRequest(id: string) {
    return await this.prisma.tenant_requests.delete({ where: { id } });
  }

  async updateRequest(id: string, data: any) {
    return await this.prisma.tenant_requests.update({
      where: { id },
      data,
      include: { requested_plan: true }
    });
  }

  async findManyRequests(filter: RequestFilter) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    
    // Add search functionality
    if (filter.search) {
      where.OR = [
        { organization_name: { contains: filter.search, mode: 'insensitive' } },
        { slug: { contains: filter.search, mode: 'insensitive' } },
        { admin_name: { contains: filter.search, mode: 'insensitive' } },
        { admin_email: { contains: filter.search, mode: 'insensitive' } }
      ];
    }
    
    const [requests, total] = await Promise.all([
      this.prisma.tenant_requests.findMany({
        where,
        include: { requested_plan: true },
        orderBy: { created_at: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit
      }),
      this.prisma.tenant_requests.count({ where })
    ]);
    
    return { requests, total };
  }

  async resetToPending(id: string, adminId: string) {
    return await this.prisma.tenant_requests.update({
      where: { id },
      data: {
        status: 'pending',
        rejection_reason: null,
        reviewed_by: adminId,
        reviewed_at: new Date()
      },
      include: { requested_plan: true }
    });
  }

  async hardDeleteRequest(id: string) {
    return await this.prisma.tenant_requests.delete({ where: { id } });
  }
}