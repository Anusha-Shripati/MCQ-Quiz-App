import { PrismaClient } from '../../db/tenant/generated/client';

export class ModuleService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getModules(filters: { name: string }) {
    const { name } = filters;
    return this.prisma.modules.findMany({
      where: {
        name: name ? { contains: 'name', mode: 'insensitive' } : undefined,
      },
    });
  }
}

export default ModuleService;
