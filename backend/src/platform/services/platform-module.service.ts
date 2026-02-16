import { PrismaClient } from '../../db/prisma/generated/client';

export class PlatformModuleService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getModules(filters: { name: string }) {
    const { name } = filters;
    return this.prisma.platform_modules.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
      },
    });
  }
}

export default PlatformModuleService;
