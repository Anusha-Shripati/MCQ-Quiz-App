import { User } from "@prisma/client"; // Import Role if needed
import { prisma } from "../db/prisma.client";

export class UserService {
  async createUser(
    data: Pick<User, "email" | "password" | "createdAt" | "role">
  ): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role, // Role is now guaranteed to match the enum
        createdAt: data.createdAt,
        isActive: true, // Default value
        permissions: {}, // Default permissions
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findManyUsers(filter: Record<string, any>): Promise<User[]> {
    return await prisma.user.findMany({
      where: filter,
    });
  }
}
