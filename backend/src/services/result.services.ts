import { prisma } from '../db/prisma.client';
import { CacheService } from './cacheService';
import { ExamMeta } from './candiate-exam.services';
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
          orderBy: {
            created_at: 'asc',
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
        verified_image: result.exam?.verified_image || null,
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
      orderBy: {
        created_at: 'desc' as const,
      },
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
            verified_image: true,
            user: {
              select: {
                id: true,
                name: true,
                deleted_at: true,
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
        verified_image: result.exam?.verified_image || null,
      };
    });

    const response = { list: processedResults, total, page, limit };

    await this.cacheService.setKey(key, response, this.cacheTime);
    return response;
  };

  async updateScore(resultId: string, questionId: string, score: number) {
    try {
      const existingResult = await prisma.results.findFirst({
        where: { id: resultId },
        include: { exam: true, answers: { include: { question: true } } },
      });
      const existingAns = await prisma.answers.findFirst({
        where: { question_id: questionId,result_id:resultId },
        include: { question: true },
      });

      if (!existingResult || !existingAns) {
        throw new Error('Result or Answer not found');
      }
      if (score > existingAns.weight) {
        throw new Error('Score should be less than or equal to its weightage');
      }

      // Extract and update tech_score
      const meta: ExamMeta = (existingResult.exam.meta as ExamMeta) || {};
      let tech_score: {
        technology_id: string;
        score: number;
        total: number;
        percentage: number;
      }[] = Array.isArray(meta.tech_score) ? meta.tech_score : [];

      tech_score = tech_score.map((item) => {
        if (item.technology_id === existingAns.question?.technology_id) {
          const allAns = existingResult.answers.filter(
            (inner) => inner.question?.technology_id == item.technology_id
          );
          const total = allAns.reduce(
            (sum, ans) => (ans.id !== existingAns.id ? sum + Number(ans.score) : sum),
            0
          );
          const newScore = total + score;
          return {
            ...item,
            score: newScore,
            percentage: (newScore * 100) / (item.total || 1),
          };
        }
        return item;
      });

      const totalScore = tech_score.reduce((sum, item) => sum + (item.score || 0), 0);

      const result = await prisma.results.update({
        where: { id: resultId },
        data: {
          score: totalScore,
          percentage: (totalScore * 100) / (existingResult.total || 1),
        },
      });

      const updatedMeta: ExamMeta = {
        ...meta,
        tech_score,
      };
      const exam = await prisma.exam.update({
        where: { id: existingResult.exam_id },
        data: { meta: updatedMeta },
      });

      const ans = await prisma.answers.update({
        where: { id: existingAns.id },
        data: { score: score },
      });

      return { result, exam, ans };
    } catch (error: any) {
      throw new Error(error.message || error);
    }
  }

async getFeedback(resultId: string) {
  const result = await prisma.results.findUnique({
    where: { id: resultId },
    select: {
      candidate_id: true,
    },
  });

  if (!result) return null;
  const candidateFeedback = await prisma.candidate_feedback.findFirst({
    where: { candidate_id: result.candidate_id },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      exam: {
        select: {
          id: true,
        },
      },
    },
  });

  return candidateFeedback;
}

}
