import { Roles, User } from "@prisma/client"; // Import Role if needed
import { prisma } from "../db/prisma.client";

export class UserService {
  async createUser(
    data: Pick<User, "email" | "password" | "created_at" | "role_id" | "name">
  ): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role_id: data.role_id,
        created_at: data.created_at,
        name: data.name
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              select: {
                can_read: true,
                can_edit: true,
                module: {
                  select: {
                    name: true,
                  },
                },
              },

            }
          },
        },
      },
    });
  }

  async findUserById(userId: string): Promise<User & { role: Roles | null } | null> {
    return await prisma.user.findUnique({
      where: { id: userId, deleted_at: null },
      include: {
        role: {
          include: {
            rolePermissions: {
              select: {
                can_read: true,
                can_edit: true,
                module: {
                  select: {
                    name: true,
                  },
                },
              },

            }
          },
        },
      }
    });
  }
  async updateUser(id: string, data: Record<string, string | null>) {
    const user = await prisma.user.update({ where: { id }, data })
    if (!user) return null;
    const { password, token, ...rest } = user;
    return rest

  }
  async changePassword(id: string, password: string) {
    const user = await prisma.user.update({ where: { id }, data:{password} })
    if (!user) return null;
    const { password:_, token, ...rest } = user;
    return rest

  }
  async findManyUsers(filter: Record<string, any>): Promise<Pick<User, 'id' | 'email' | 'role_id'>[]> {
    return await prisma.user.findMany({
      where: {
        ...filter,
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role_id: true,
        created_at: true,
        deleted_at: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
  }
  async delete(id: string) {
    return await prisma.user.update({
      where: { id: id },
      data: { deleted_at: new Date() },
    });
  }
}
