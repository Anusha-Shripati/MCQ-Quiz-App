import { Questions, Technology, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.client';
import { CacheService } from './cacheService';
export class TechnologyService {
  private cacheService;
  private cacheTime = 60;

  constructor(){
    this.cacheService = new CacheService()
  }

  async getTechnologies(filters: { name: string }): Promise<Technology[]> {
    const { name } = filters;
    const key = this.cacheService.generateKey('technology-all',{name});
    const data = await this.cacheService.getKey(key);
    if(data) return JSON.parse(data)

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
        assessment_technology: {}
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const response= technologies
    .map((tech) => {
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

    await this.cacheService.setKey(key,response,this.cacheTime)
    
    return response
  }
  async createTechnology(data: { name: string, questions: Omit<Questions, 'id'>[] }) {

    const result = await prisma.$transaction(async (tx) => {
      const technology = await tx.technology.create({ data: { name: data.name } });
      const arr = data.questions?.map((item) => ({
        ...item,
        technology_id: technology.id,
        options: item.options as Prisma.InputJsonValue,
        meta: item.meta as Prisma.InputJsonValue
      }))
      const questions = await tx.questions.createMany({ data: arr })
      return questions
    })
    return result

  }

  async updateTechnology(
    id: string,
    data: { name: string; deleted_at?: Date | null, questions: Omit<Questions, 'id'>[] }
  ){
    const result = await prisma.$transaction(async (tx) => {
      // await tx.questions.deleteMany({ where: { technology_id: id } })
      // const technology = await tx.technology.update({ where: { id }, data: { name: data.name, deleted_at: data.deleted_at } });
      const arr = data.questions?.map((item) => ({
        ...item,
        technology_id: id,
        options: item.options as Prisma.InputJsonValue,
        meta: item.meta as Prisma.InputJsonValue
      }))
      const questions = await tx.questions.createMany({ data: arr })
      return questions
    })
    return result
  }
  async getTechnologyById(id: string) {
    const data = await this.cacheService.getKey(`technology:${id}`);
    if(data) JSON.parse(data)

    const response =  prisma.technology.findUnique({ where: { id }, include: { questions:{ orderBy:{created_at:'asc'}} } });
    await this.cacheService.setKey(`technology:${id}`,response,this.cacheTime)
    
    return response
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
