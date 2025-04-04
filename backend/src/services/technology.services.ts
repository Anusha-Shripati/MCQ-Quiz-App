import { Technology } from "@prisma/client";
import { prisma } from "../db/prisma.client";

export class TechnologyService {
    async getTechnologies(filters: { name: string }) : Promise<Technology[]> {
        const { name } = filters;
        return prisma.technology.findMany({
            where: {
                name: name ? { contains: name, mode: 'insensitive' } : undefined,
                deleted_at: null
            },
        })
    }
    async createTechnology(data: { name: string }): Promise<Technology | null>  {
        return prisma.technology.create({ data: data })
    }

    async updateTechnology(id: string, data: { name: string }): Promise<Technology | null>  {
        return prisma.technology.update({ where: { id }, data })
    }
    async getTechnologyById(id: string) {
        return prisma.technology.findUnique({ where: { id } })
    }
    async getTechnologyByName(name: string): Promise<Technology | null>  {
        return prisma.technology.findUnique({ where: { name } })
    }
    async deleteTechnology(id: string): Promise<Technology | null>  {
        return prisma.technology.update({ where: { id }, data: { deleted_at: new Date() } })
    }
}