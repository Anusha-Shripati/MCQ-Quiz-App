import { Assessments, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.client';
import { CacheService } from './cacheService';

interface Filters {
  name?: string;
  created_by?: string;
  created_from?: string;
  created_to?: string;
  page?: number;
  limit?: number;
}
interface technologyPayload {
  easy: number;
  medium: number;
  hard: number;
  technology_id: string;
  assessment_id: string;
}

// Using Prisma's generated types for input data
type AssessmentCreateInput = Prisma.AssessmentsCreateInput;
type AssessmentUpdateInput = Prisma.AssessmentsUpdateInput;

export class AssessmentsService {
  public cacheService;
  private cacheTime = 60;

  constructor() {
    this.cacheService = new CacheService();
  }
  async getAssessments(filters: Filters) {

    const { name, created_by, created_from, created_to } = filters;

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const key = this.cacheService.generateKey('assessments', {page, name, created_by, created_from, created_to })
    const data = await this.cacheService.getKey(key)
    if (data) {
      return JSON.parse(data)
    }
    const query: any = {
      name: name ? { contains: name, mode: 'insensitive' } : undefined,
      created_by: created_by && created_by != 'all' ? created_by : undefined,
      created_at:
        created_from && created_to
          ? { gte: new Date(created_from), lte: new Date(created_to) }
          : undefined,
      deleted_at: null,
    };
    const assessments = await prisma.assessments.findMany({
      where: { ...query },
      include: {
        technologies: {
          include: {
            technology: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        created_by_user: {
          select: {
            id: true,
            name: true,
            deleted_at:true
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await prisma.assessments.count({
      where: { ...query },
    });
    const response =  {
      list: assessments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    await this.cacheService.setKey(key,response,this.cacheTime)
    return response
  }
  async createAssessments(data: AssessmentCreateInput): Promise<Assessments> {
    console.log(data);
    
    return prisma.assessments.create({ data });
  }

  async updateAssessments(id: string, data: AssessmentUpdateInput) {
    return prisma.assessments.update({ where: { id }, data });
  }
  async getAssessmentById(id: string) {
    const data = await this.cacheService.getKey(`assessment:${id}`);
    if(data) return JSON.parse(data)
    const response= prisma.assessments.findUnique({
      where: { id },
      include: {
        technologies: {
          where: { 
            deleted_at: null
          },
          include: {
            technology: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    await this.cacheService.setKey(`assessment:${id}`,response,this.cacheTime)
    return response
  }
  async deleteAssessment(id: string): Promise<Assessments | null> {
    return prisma.assessments.update({ where: { id }, data: { deleted_at: new Date() } });
  }
  async assignTechnologiesToAssessment(assessmentId: string, technology: technologyPayload[]) {
    const assessment_technologies = technology.map((item) => {
      item.assessment_id = assessmentId;
      return item;
    });
    return prisma.assessment_technology.createMany({ data: assessment_technologies });
  }
  async deleteTechnologyAssessment(assessment_id: string) {
    return prisma.assessment_technology.deleteMany({
      where: { assessment_id }
    });
  }
  async getAllAssessments() {

    const data = await this.cacheService.getKey('assessment-all');

    if(data) return JSON.parse(data);

    const assessments = await prisma.assessments.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        technologies: {
          select: {
            technology: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    const response=  assessments.map((assessment: any) => {
      return {
        ...assessment,
        technologies: assessment.technologies.map((item: any) => item.technology),
      };
    });
    await this.cacheService.setKey('assessment-all',response,this.cacheTime);
    return response;
  }
}

export default AssessmentsService;
