import { Roles } from '@prisma/client';
import { prisma } from '../db/prisma.client';
import { Permissions } from '../controllers/role.controllers';

export class RoleService {
  async getRoles(filters: { name: string }) {
    const { name } = filters;
    return prisma.roles.findMany({
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
  }
  async findRoleByName(name: string): Promise<Roles | null> {
    return await prisma.roles.findUnique({
      where: {
        name,
      },
    });
  }

  async findRoleById(id: string): Promise<Roles | null> {
    return prisma.roles.findUnique({ where: { id } });
  }

  async createRole(name: string): Promise<Roles> {
    return prisma.roles.create({
      data: {
        name,
      },
    });
  }
  async deleteRolePermissions(roleId: string) {
    return prisma.role_permissions.deleteMany({
      where: {
        role_id: roleId,
      },
    });
  }

  async deleteRole(roleId: string) {
    return prisma.roles.deleteMany({
      where: {
        id: roleId,
      },
    });
  }
  async assignPermissionsToRole(roleId: string, permissions: Permissions[]) {
    const role_permissions = permissions.map((p) => {
      return {
        can_read: p.can_read,
        can_edit: p.can_edit,
        module_id: p.module_id,
        role_id: roleId,
      };
    });
    return prisma.role_permissions.createMany({ data: role_permissions });
  }

  async updateRole(id: string, data: { name?: string }) {
    return prisma.roles.update({ where: { id }, data });
  }
  async getPermissionByRole(id: string) {
    return prisma.role_permissions.findMany({ where: { role_id: id }, include: { module: true } });
  }
}

export default RoleService;
