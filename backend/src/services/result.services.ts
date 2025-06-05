import { prisma } from '../db/prisma.client';

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
  get = async (id: string) => {
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

      return {
        ...result,
        is_passed: isPassed,
        pass_criteria: passCriteria,
      };
    }

    return result;
  };

  list = async (params: ResultParams) => {
    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ? Number(params.limit) : 10;
    const skip = (page - 1) * limit;
    const assessment_ids = params.assessment_ids?.split(',') || [];
    const technology_ids = params.technology_ids?.split(',') || [];

    const exam: any = {
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
        exam: {
          deleted_at: null,
        },
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
                pass_criteria: true, // Add pass_criteria to assessment selection
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

    return { list: processedResults, total, page, limit };
  };
}
