import { User, PrismaClient } from '../../db/tenant/generated/client';

export class ProfileService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUserDetail(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}

export default ProfileService;
