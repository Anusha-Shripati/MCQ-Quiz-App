import { Roles } from '@prisma/client';
import { prisma } from '../db/prisma.client';
import { Permissions } from '../controllers/role.controllers';
import { CacheService } from './cacheService';

export class RoleService {
  private cacheService;
  private cacheTime = 60;

  constructor() {
    this.cacheService = new CacheService();
  }

  async getRoles(filters: { name: string }) {
    const { name } = filters;
    const key = this.cacheService.generateKey('roles:all', { name });
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const roles = await prisma.roles.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
      },
      include: {
        role_permissions: {
          include: {
            module: {
              select: { name: true },
            },
          },
        },
      },
    });

    await this.cacheService.setKey(key, roles, this.cacheTime);
    return roles;
  }

  async findRoleByName(name: string): Promise<Roles | null> {
    const key = `role:name:${name}`;
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const role = await prisma.roles.findUnique({
      where: { name },
    });
    await this.cacheService.setKey(key, role, this.cacheTime);
    return role;
  }

  async findRoleById(id: string): Promise<Roles | null> {
    const key = `role:id:${id}`;
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const role = await prisma.roles.findUnique({ where: { id } });
    await this.cacheService.setKey(key, role, this.cacheTime);
    return role;
  }

  async createRole(name: string): Promise<Roles> {
    const role = await prisma.roles.create({
      data: { name },
    });
    // Optionally, you may want to clear related cache here
    return role;
  }

  async deleteRolePermissions(roleId: string) {
    return prisma.role_permissions.deleteMany({
      where: { role_id: roleId },
    });
  }

  async deleteRole(roleId: string) {
    return prisma.roles.delete({
      where: {
        id: roleId,
      },
    });
  }

  async assignPermissionsToRole(roleId: string, permissions: Permissions[]) {
    const role_permissions = permissions.map((p) => ({
      can_read: p.can_read,
      can_edit: p.can_edit,
      module_id: p.module_id,
      role_id: roleId,
    }));
    return prisma.role_permissions.createMany({ data: role_permissions });
  }

  async updateRole(id: string, data: { name?: string }) {
    const role = await prisma.roles.update({ where: { id }, data });
    // Optionally, you may want to clear related cache here
    return role;
  }

  async getPermissionByRole(id: string) {
    const key = `role:permissions:${id}`;
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const permissions = await prisma.role_permissions.findMany({
      where: { role_id: id },
      include: { module: true },
    });
    await this.cacheService.setKey(key, permissions, this.cacheTime);
    return permissions;
  }

  async checkRoleHasUsers(roleId: string): Promise<number> {
    return await prisma.user.count({
      where: {
        role_id: roleId,
        deleted_at: null,
      },
    });
  }

async nullifyRoleForSoftDeletedUsers(roleId: string) {
  return prisma.user.updateMany({
    where: {
      role_id: roleId,
      NOT: { deleted_at: null },
    },
    data: {
      role_id: undefined,
    },
  });
}
async countAllUsersByRole(roleId: string): Promise<number> {
  return prisma.user.count({
    where: {
      role_id: roleId,
      deleted_at: null,
    },
  });
}

}


export default RoleService;