import { prisma } from '../db/prisma.client';

export class ModuleService {
  async getModules(filters: { name: string }) {
    const { name } = filters;
    return prisma.modules.findMany({
      where: {
        name: name ? { contains: 'name', mode: 'insensitive' } : undefined,
      },
    });
  }
}

export default ModuleService;
