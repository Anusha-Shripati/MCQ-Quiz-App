import { User } from "@prisma/client"; // Import Role if needed
import { prisma } from "../db/prisma.client";

export class UserService {
  async createUser(
    data: Pick<User, "email" | "password" | "createdAt" | "role_id">
  ): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role_id: data.role_id,
        createdAt: data.createdAt,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email,deletedAt: null },
      include: {
        role: {
          include: {
            rolesPermissions: {
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

  async findUserById(userId: string): Promise<User | null> {
    // console.log(userId, "id");
    return await prisma.user.findUnique({
      where: { id: userId,deletedAt: null},
    });
  }
  async updateUser(id: string, data: Record<string, string>) {
    const user = await prisma.user.update({ where: { id }, data })
    if (!user) return null;
    const { password, token, ...rest } = user;
    return rest

  }
  async findManyUsers(filter: Record<string, any>): Promise<Pick<User, 'id' | 'email' | 'role_id'>[]> {
    return await prisma.user.findMany({
      where: {
        ...filter,
        deletedAt: null,  
      },
      select: {
        id: true,
        email: true,
        role_id: true,
        createdAt: true,
        updatedAt: true,
        role:{
          select:{
            name:true
          }
        }
      },
    });
  }
  async delete(id: string) {
    return await prisma.user.update({
      where: { id: id },
      data: { deletedAt: new Date() }, 
    });
  }
}
