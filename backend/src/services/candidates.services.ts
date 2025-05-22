import { Candidate, Prisma, PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../common/errors/AppError';
import { CreateCandidate, UpdateCandidate } from '../types/candidate.types';
import ExamService from './exam.services';

const prisma = new PrismaClient();
const examService = new ExamService();

export default class CandidatesService {
  async createCandidate(data: CreateCandidate & { exam_id: string }) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existingEmail = await tx.candidate.findUnique({
          where: { email: data.email },
        });
        if (existingEmail && existingEmail.deleted_at === null) {
          throw new AppError('Email already exists', 400);
        } else if (existingEmail && existingEmail.deleted_at !== null) {

          await prisma.answers.deleteMany({
            where: { candidate_id: existingEmail.id },
          });
          await prisma.candidate.delete({
            where: { id: existingEmail.id },
          });
        }

        const existingPhone = await tx.candidate.findUnique({
          where: { phone: data.phone },
        });
        if (existingPhone && existingPhone.deleted_at === null) {
          throw new AppError('Phone number already exists', 400);
        } else if (existingPhone && existingPhone.deleted_at !== null) {
          await prisma.answers.deleteMany({
            where: { candidate_id: existingPhone.id },
          });
          await prisma.candidate.delete({
            where: { id: existingPhone.id },
          });
        }

        const newCandidate = await prisma.candidate.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            experience: data.experience,
            assessment_id: data.assessment_id,
            exam_id: data.exam_id,
            meta: data.meta as Prisma.JsonObject,
          },
          include: {
            assessment: true,
            exam: true
          },
        });
        const meta = await this.generateCandiateAccessToken(data.exam_id, newCandidate);

        const upadtedCandidate = await prisma.candidate.update({ where: { id: newCandidate.id },data: { meta } })

        return upadtedCandidate;
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create candidate. Please try again later.', 500);
    }
  }

  async updateCandidate(id: string, data: UpdateCandidate) {
    try {

      const result = await prisma.$transaction(async (tx) => {
        const existingCandidate = await tx.candidate.findUnique({
          where: { id },
          include: {
            assessment: true,
            exam: {
              include: {
                exam_questions: true,
              },
            },
          },
        });

        if (!existingCandidate) {
          throw new AppError('Candidate not found', 404);
        }

        if (data.email && data.email !== existingCandidate.email) {
          const existingEmail = await tx.candidate.findUnique({
            where: { email: data.email, deleted_at: null },
          });

          if (existingEmail && existingEmail.deleted_at === null) {
            throw new AppError('Email already exists', 400);
          } else if (existingEmail && existingEmail.deleted_at !== null) {
            await tx.candidate.delete({
              where: { id: existingEmail.id },
            });
          }
        }

        if (data.phone && data.phone !== existingCandidate.phone) {
          const existingPhone = await tx.candidate.findUnique({
            where: { phone: data.phone, deleted_at: null },
          });

          if (existingPhone && existingPhone.deleted_at === null) {
            throw new AppError('Phone number already exists', 400);
          } else if (existingPhone && existingPhone.deleted_at !== null) {
            await tx.candidate.delete({
              where: { id: existingPhone.id },
            });
          }
        }

        if (data.assessment_id && data.assessment_id !== existingCandidate.assessment_id) {
          if (!existingCandidate.exam) {
            throw new AppError('Exam not found for candidate', 404);
          }

          if (existingCandidate.exam.is_completed) {
            throw new AppError('Exam is completed. Cannot change assessment', 400);
          }

          await tx.exam_questions.deleteMany({
            where: { exam_id: existingCandidate.exam.id },
          });

          await examService.createExamQuestionsForAssessment(
            existingCandidate.exam.id,
            data.assessment_id
          );
        }
        const meta = await this.generateCandiateAccessToken(existingCandidate.exam.id, { ...existingCandidate, ...data });

        const newCandidate = await tx.candidate.update({
          where: { id },
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            experience: data.experience,
            assessment_id: data.assessment_id,
            meta: meta as Prisma.JsonObject,
          },
          include: {
            assessment: true,
            exam: {
              include: {
                exam_questions: true,
              },
            },
          },
        });


        return newCandidate
      });
      return result;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create candidate. Please try again later.', 500);
    }
  }

  async deleteCandidate(id: string) {
    return await prisma.candidate.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async getCandidates(query: {
    created?: string;
    limit?: string;
    page?: string;
    search?: string;
    assessmentFilter?: string | string[];
  }) {
    const where: Prisma.CandidateWhereInput = { deleted_at: null };

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.created) {
      try {
        const dateRange = JSON.parse(query.created)?.range;
        if (dateRange) {
          const fromDate = dateRange.from ? new Date(dateRange.from) : null;
          const toDate = dateRange.to ? new Date(dateRange.to) : null;
          if (fromDate && toDate && !isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            where.created_at = {
              gte: fromDate,
              lte: toDate,
            };
          }
        }

      } catch (error) {
        console.error('Invalid date range format:', error);
      }
    }

    if (query.assessmentFilter) {
      where.assessment_id = Array.isArray(query.assessmentFilter)
        ? { in: query.assessmentFilter }
        : query.assessmentFilter;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.candidate.count({ where });

    const candidates = await prisma.candidate.findMany({
      where,
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
        exam: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    });
    return {
      list: candidates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCandidateById(id: string) {
    try {
      return await prisma.candidate.findUnique({
        where: { id },
        include: {
          assessment: true,
          exam: true,
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch candidate', 500);
    }
  }

  async getCandidateByExamId(id: string) {
    return await prisma.candidate.findFirst({
      where: { exam_id: id },
      select: {
        name: true,
        email: true,
        phone: true,
        experience: true,
      },
    });
  }

  private async generateCandiateAccessToken(examId: string, candidate: any) {
    try {


      if (!candidate) {
        throw new AppError('Candidate not found', 404);
      }

      if (!candidate.exam) {
        throw new AppError('No exam associated with this candidate', 404);
      }

      const examEndTime = new Date(candidate.exam.end_time);
      const now = new Date();
      const expiresInSeconds = Math.floor((examEndTime.getTime() - now.getTime()) / 1000);
      const code = Math.random().toString(36).substring(2, 15);

      if (expiresInSeconds <= 0) {
        throw new AppError('Exam has already expired', 400);
      }

      const token = jwt.sign(
        {
          examId,
          candidateId: candidate.id,
        },
        process.env.ACCESS_SECRET || 'exam-secret-key',
        { expiresIn: expiresInSeconds }
      );

      const examLink = `${process.env.FRONTEND_URL}/test/${examId}?code=${code}`;

      const updatedMeta = {
        ...(candidate.meta || {}),
        accessCode: code,
        accessToken: token,
        examLink: examLink,
        tokenCreatedAt: now.toISOString(),
        tokenExpiresAt: examEndTime.toISOString(),
      };

      return updatedMeta;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to generate exam access token', 500);
    }
  }
}
