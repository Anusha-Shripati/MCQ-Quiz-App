import { Assessments } from '@prisma/client';
import { prisma } from '../db/prisma.client';

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

type AseessmentPayload = Pick<
  Assessments,
  'name' | 'created_by' | 'easy' | 'medium' | 'hard' | 'duration'
>;

export class AssessmentsService {
  async getAssessments(filters: Filters) {
    const { name, created_by, created_from, created_to } = filters;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
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
    return {
      list: assessments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async createAssessments(data: AseessmentPayload): Promise<Assessments> {
    return prisma.assessments.create({ data: data });
  }

  async updateAssessments(id: string, data: AseessmentPayload) {
    return prisma.assessments.update({ where: { id }, data });
  }
  async getAssessmentById(id: string) {
    return prisma.assessments.findUnique({
      where: { id },
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
      },
    });
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
      where: { assessment_id },
    });
  }
  async getAllAssessments() {
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
    return assessments.map((assessment: any) => {
      return {
        ...assessment,
        technologies: assessment.technologies.map((item: any) => item.technology),
      };
    });
  }
}

export default AssessmentsService;
