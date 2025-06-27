import { prisma } from '../db/prisma.client';
import { CacheService } from './cacheService';
import { UploadService } from './upload.services';

interface ResultParams {
  page?: string;
  limit?: string;
  search?: string;
  assessment_ids?: string;
  technology_ids?: string;
  startDate?: Date;
  endDate?: Date;
  percentageFrom?: string;
  percentageTo?: string;
  experienceFrom?: string;
  experienceTo?: string;
}
export class ResultService {
  private cacheService;
  private uploadService;
  private cacheTime = 60;

  constructor() {
    this.cacheService = new CacheService();
    this.uploadService = new UploadService();
  }

  get = async (id: string) => {
    const data = await this.cacheService.getKey(`result:${id}`);
    if (data) return JSON.parse(data);

    const result = await prisma.results.findFirst({
      where: { id: id },
      include: {
        exam: {
          include: {
            assessment: {
              include: {
                technologies: {
                  include: {
                    technology: true,
                  },
                },
              },
            },
            candidate: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });

    if (result) {
      const passCriteria = result.exam?.assessment?.pass_criteria;
      const isPassed = result.percentage >= passCriteria;

      result.answers.map((answer) => {
        if (answer?.question?.options && Array.isArray(answer.question.options)) {
          answer.question.options = answer.question.options.filter(
            (option) => typeof option === 'string' && option.trim() !== ''
          );
        }
      });

      return {
        ...result,
        is_passed: isPassed,
        pass_criteria: passCriteria,
      };
    }

    await this.cacheService.setKey(`question:${id}`, result, this.cacheTime);
    return result;
  };

  list = async (params: ResultParams) => {
    const key = this.cacheService.generateKey('questions', params);
    const data = await this.cacheService.getKey(key);
    if (data) return JSON.parse(data);

    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ? Number(params.limit) : 10;
    const skip = (page - 1) * limit;
    const assessment_ids = params.assessment_ids?.split(',') || [];
    const technology_ids = params.technology_ids?.split(',') || [];

    const exam: any = {
      deleted_at: null,
      ...(params.search && {
        OR: [
          {
            candidate: {
              name: {
                contains: params.search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            candidate: {
              email: {
                contains: params.search.trim(),
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
      ...(assessment_ids?.length && {
        assessment_id: { in: assessment_ids },
      }),
      ...(technology_ids?.length && {
        assessment: {
          technologies: {
            some: { technology_id: { in: technology_ids } },
          },
        },
      }),
      ...((params.startDate || params.endDate) && {
        start_time: {
          ...(params.startDate && { gte: params.startDate }),
          ...(params.endDate && { lte: params.endDate }),
        },
      }),
    };

    const percentage =
      params.percentageFrom !== undefined || params.percentageTo !== undefined
        ? {
            ...(params.percentageFrom !== undefined && {
              gte: parseFloat(params.percentageFrom),
            }),
            ...(params.percentageTo !== undefined && {
              lte: parseFloat(params.percentageTo),
            }),
          }
        : undefined;
    const experience =
      params.experienceFrom !== undefined || params.experienceTo !== undefined
        ? {
            ...(params.experienceFrom !== undefined && {
              gte: parseFloat(params.experienceFrom),
            }),
            ...(params.experienceTo !== undefined && {
              lte: parseFloat(params.experienceTo),
            }),
          }
        : undefined;
    exam.candidate = {
      ...(Object.keys(exam.candidate || {}).length && exam.candidate),
      ...(experience && { experience }),
    };

    const where = {
      deleted_at: null,
      ...(Object.keys(exam).length && {
        exam,
      }),
      ...(percentage && { percentage }),
    };
    const query = {
      where,
      skip,
      take: limit,
      select: {
        id: true,
        score: true,
        total: true,
        percentage: true,
        exam: {
          select: {
            assessment: {
              select: {
                technologies: {
                  select: {
                    technology: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    id: true,
                  },
                },
                id: true,
                name: true,
                pass_criteria: true,
              },
            },
            start_time: true,
            end_time: true,
            user_id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            is_completed: true,
            status: true,
            meta: true,
            created_at: true,
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                experience: true,
              },
            },
          },
        },
      },
    };
    const results = await prisma.results.findMany(query);
    const total = await prisma.results.count({ where });

    const processedResults = results.map((result) => {
      const passCriteria = result.exam?.assessment?.pass_criteria || 0;
      const isPassed = result.percentage >= passCriteria;

      return {
        ...result,
        is_passed: isPassed,
        pass_criteria: passCriteria,
      };
    });

    const response = { list: processedResults, total, page, limit };

    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  };
}
