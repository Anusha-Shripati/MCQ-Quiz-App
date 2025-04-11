import { Technology } from "@prisma/client";
import { prisma } from "../db/prisma.client";

export class TechnologyService {
  async getTechnologies(filters: { name: string }): Promise<Technology[]> {
    const { name } = filters;
    const technologies = await prisma.technology.findMany({
      where: {
        name: name ? { contains: name, mode: "insensitive" } : undefined,
        deleted_at: null,
      },
      include: {
        questions: true,
      },
      orderBy:{
        created_at: "desc",
      }
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
    data: { name: string }
  ): Promise<Technology | null> {
    return prisma.technology.update({ where: { id }, data });
  }
  async getTechnologyById(id: string) {
    return prisma.technology.findUnique({ where: { id } });
  }
  async getTechnologyByName(name: string): Promise<Technology | null> {
    return prisma.technology.findUnique({ where: { name } });
  }
  async deleteTechnology(id: string): Promise<Technology | null> {
    return prisma.technology.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
  // async getTechnologiesWithQuestions() {
  //   const technologies = await prisma.technology.findMany({
  //     where:{
  //       deleted_at: null,
  //     },
  //     include: {
  //       questions: true,
  //     },
  //   });

  //   return technologies.map((tech) => {
  //     const difficultyCount = {
  //       easy: 0,
  //       medium: 0,
  //       hard: 0,
  //     };
  //     tech.questions.forEach((q) => {
  //       if (
  //         q.difficulty_level &&
  //         difficultyCount[q.difficulty_level as keyof typeof difficultyCount] !== undefined
  //       ) {
  //         difficultyCount[q.difficulty_level as keyof typeof difficultyCount]++;
  //       }
  //     });
  //     const { questions, ...rest } = tech;
  //     return {
  //       ...rest,
  //       difficultyCount,
  //     };
  //   });
  // }
}
