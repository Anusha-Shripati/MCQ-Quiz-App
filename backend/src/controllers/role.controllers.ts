import { Request, Response, NextFunction } from "express";
import RoleService from "../services/role.services";
import { generateResponse } from "../utils/generateResponse";

export interface Permissions {
    can_edit: boolean;
    can_read: boolean;
    module_id: string;
}

export interface RolePayload {
    name: string,
    permissions: Permissions[]
}
const roleService = new RoleService()
export class RoleController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, rolePermissions } = req.body;
            const existingRole = await roleService.findRoleByName(name)
            if (existingRole) {
                return generateResponse(res, 400, {}, false, "Role name already exists");
            }

            const newRole = await roleService.createRole(name);
            if (rolePermissions && rolePermissions.length > 0) {
                await roleService.assignPermissionsToRole(newRole.id, rolePermissions);
            }
            return generateResponse(res, 200, newRole, true, "Role created successfully");
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { name, rolePermissions } = req.body;
            const existingRole = await roleService.findRoleById(id);
            if (!existingRole) {
                return generateResponse(res, 404, {}, false, "Role not found!");
            }

            if (name && name !== existingRole.name) {
                const duplicateRole = await roleService.findRoleByName(name);
                if (duplicateRole) {
                    return generateResponse(res, 400, {}, false, "Role name already exists!");
                }
            }

            const updatedRole = await roleService.updateRole(id, { name });
            
            if (rolePermissions && Array.isArray(rolePermissions)) {
                await roleService.deleteRolePermissions(id)
                await roleService.assignPermissionsToRole(updatedRole.id, rolePermissions);
            }
            return generateResponse(res, 200, updatedRole, true, "Role updated successfully");
        } catch (error) {
            next(error);
        }
    }
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const existingRole = await roleService.findRoleById(id);
            if (!existingRole) {
                return generateResponse(res, 404, {}, false, "Role not found!");
            }
            await roleService.deleteRolePermissions(id)
            await roleService.deleteRole(id)
            return generateResponse(res, 200, {}, true, "Role delete successfully");

        } catch (error) {
            next(error);

        }
    }
    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { search } = req.query
            const roles = await roleService.getRoles({
                name: search as string,
            });
            return generateResponse(res, 200,   { list: roles, count: roles.length }, true, "Role fetched successfully");

        } catch (error) {
            next(error);
        }
    }
}