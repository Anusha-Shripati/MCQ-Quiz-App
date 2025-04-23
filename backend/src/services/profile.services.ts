import { User } from '@prisma/client'; // Import Role if needed
import { prisma } from '../db/prisma.client';

export class ProfileService {
  async getUserDetail(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}

export default ProfileService;
