import { PrismaClient } from '../../db/prisma/generated/client';
import { Permissions } from '../controllers/platform-role.controller';

export class PlatformRoleService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getRoles(filters: { name: string }) {
    const { name } = filters;
    const roles = await this.prisma.platform_roles.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
      },
      include: {
        role_permissions: {
          include: {
            module: {
              select: { name: true, key: true },
            },
          },
        },
      },
    });
    return roles;
  }

  async findRoleByName(name: string) {
    const role = await this.prisma.platform_roles.findUnique({
      where: { name },
    });
    return role;
  }

  async findRoleById(id: string) {
    const role = await this.prisma.platform_roles.findUnique({ where: { id } });
    return role;
  }

  async findRoleByIdWithPermissions(id: string) {
    const role = await this.prisma.platform_roles.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            module: {
              select: { name: true, key: true, id: true },
            },
          },
        },
      },
    });
    return role;
  }

  async createRole(name: string, description?: string) {
    const role = await this.prisma.platform_roles.create({
      data: { name, description },
    });
    return role;
  }

  async deleteRolePermissions(roleId: string) {
    return this.prisma.platform_role_permissions.deleteMany({
      where: { role_id: roleId },
    });
  }

  async deleteRole(roleId: string) {
    return this.prisma.platform_roles.delete({
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
    return this.prisma.platform_role_permissions.createMany({ data: role_permissions });
  }

  async updateRole(id: string, data: { name?: string; description?: string }) {
    const role = await this.prisma.platform_roles.update({ where: { id }, data });
    return role;
  }

  async getPermissionByRole(id: string) {
    const permissions = await this.prisma.platform_role_permissions.findMany({
      where: { role_id: id },
      include: { module: true },
    });
    return permissions;
  }

  async checkRoleHasAdmins(roleId: string): Promise<number> {
    return await this.prisma.platform_admins.count({
      where: {
        role_id: roleId,
        deleted_at: null,
      },
    });
  }

  async nullifyRoleForSoftDeletedAdmins(roleId: string) {
    return this.prisma.platform_admins.updateMany({
      where: {
        role_id: roleId,
        NOT: { deleted_at: null },
      },
      data: {
        role_id: null,
      },
    });
  }

  async countAllAdminsByRole(roleId: string): Promise<number> {
    return this.prisma.platform_admins.count({
      where: {
        role_id: roleId,
        deleted_at: null,
      },
    });
  }
}

export default PlatformRoleService;
