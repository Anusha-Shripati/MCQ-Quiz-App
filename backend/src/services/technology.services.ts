import { Technology } from '@prisma/client';
import { prisma } from '../db/prisma.client';

export class TechnologyService {
  async getTechnologies(filters: { name: string }): Promise<Technology[]> {
    const { name } = filters;
    const technologies = await prisma.technology.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
        deleted_at: null,
      },
      include: {
        questions: {
          where: {
            deleted_at: null,
          },
        },
        assessment_technology: {
          where: {
            deleted_at: null,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return technologies.map((tech) => {
      const difficultyCount = {
        easy: 0,
        medium: 0,
        hard: 0,
      };
      tech.questions.forEach((q) => {
        if (
          q.difficulty_level &&
          difficultyCount[q.difficulty_level as keyof typeof difficultyCount] !== undefined
        ) {
          difficultyCount[q.difficulty_level as keyof typeof difficultyCount]++;
        }
      });
      const { questions, ...rest } = tech;
      return {
        ...rest,
        difficultyCount,
      };
    });
  }
  async createTechnology(data: { name: string }): Promise<Technology | null> {
    return prisma.technology.create({ data: data });
  }

  async updateTechnology(
    id: string,
    data: { name: string; deleted_at?: Date | null }
  ): Promise<Technology | null> {
    return prisma.technology.update({ where: { id }, data });
  }
  async getTechnologyById(id: string) {
    return prisma.technology.findUnique({ where: { id }, include: { questions: true } });
  }
  async getTechnologyByName(name: string): Promise<Technology | null> {
    return prisma.technology.findUnique({ where: { name } });
  }

  async deleteTechnology(id: string): Promise<Technology | null> {
    const currentDate = new Date();

    return await prisma.$transaction(async (tx) => {
      await tx.questions.updateMany({
        where: {
          technology_id: id,
          deleted_at: null,
        },
        data: {
          deleted_at: currentDate,
        },
      });

      // Soft delete associated assessment_technology records
      await tx.assessment_technology.updateMany({
        where: {
          technology_id: id,
        },
        data: {
          deleted_at: currentDate,
        },
      });

      const deletedTechnology = await tx.technology.update({
        where: { id },
        data: {
          deleted_at: currentDate,
        },
        include: {
          questions: true,
          assessment_technology: true,
        },
      });

      return deletedTechnology;
    });
  }
}
