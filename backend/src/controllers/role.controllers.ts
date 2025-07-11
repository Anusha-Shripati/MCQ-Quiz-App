import { Request, Response, NextFunction } from 'express';
import RoleService from '../services/role.services';
import { generateResponse } from '../utils/generateResponse';

export interface Permissions {
  can_edit: boolean;
  can_read: boolean;
  module_id: string;
}

export interface RolePayload {
  name: string;
  permissions: Permissions[];
}
const roleService = new RoleService();
export class RoleController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, role_permissions } = req.body;
      const existingRole = await roleService.findRoleByName(name);
      if (existingRole) {
        return generateResponse(res, 400, {}, false, 'Role name already exists');
      }

      const newRole = await roleService.createRole(name);
      if (role_permissions && role_permissions.length > 0) {
        await roleService.assignPermissionsToRole(newRole.id, role_permissions);
      }
      return generateResponse(res, 200, newRole, true, 'Role created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, role_permissions } = req.body;
      const existingRole = await roleService.findRoleById(id);
      if (!existingRole) {
        return generateResponse(res, 404, {}, false, 'Role not found!');
      }

      if (name && name !== existingRole.name) {
        const duplicateRole = await roleService.findRoleByName(name);
        if (duplicateRole) {
          return generateResponse(res, 400, {}, false, 'Role name already exists!');
        }
      }

      const updatedRole = await roleService.updateRole(id, { name });

      if (role_permissions && Array.isArray(role_permissions)) {

        await roleService.deleteRolePermissions(id)
        await roleService.assignPermissionsToRole(updatedRole.id, role_permissions);
      }
      return generateResponse(res, 200, updatedRole, true, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  };

delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Step 1: Check if role exists
    const existingRole = await roleService.findRoleById(id);
    if (!existingRole) {
      return generateResponse(res, 404, {}, false, 'Role not found!');
    }

    const totalUserCount = await roleService.countAllUsersByRole(id);
    if (totalUserCount > 0) {
      return generateResponse(
        res,
        400,
        { userCount: totalUserCount },
        false,
        `Cannot delete this role. ${totalUserCount} users are still assigned to it. Please reassign or permanently delete them first.`
      );
    }
    await roleService.nullifyRoleForSoftDeletedUsers(id);
    await roleService.deleteRolePermissions(id);
    await roleService.deleteRole(id);

    return generateResponse(res, 200, {}, true, 'Role deleted successfully');
  } catch (error) {
    console.error('Error in delete role:', error);
    next(error);
  }
};

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      const roles = await roleService.getRoles({
        name: search as string,
      });
      return generateResponse(
        res,
        200,
        { list: roles, count: roles.length },
        true,
        'Role fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
