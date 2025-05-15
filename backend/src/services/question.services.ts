import { Prisma, Questions } from '@prisma/client';
import { prisma } from '../db/prisma.client';

interface QuestionsPayload {
  technology_id: string;
  question: string;
  correct_answer: string[];
  options: any;
  time: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  type: 'multiple_select' | 'video' | 'text' | 'mcq' | 'code_snippet';
  meta: any;
}

export class QuestionService {
  async getQuestions(filters: {
    technology_id?: string;
    page?: string;
    limit?: string;
    difficulty_level?: string;
    search?: string;
  }) {
    const page = filters.page ? Number(filters.page) : undefined;
    const limit = filters.page ? Number(filters.limit) : undefined;

    const query: Prisma.QuestionsWhereInput = {
      deleted_at: null,
      technology_id: filters.technology_id ? filters.technology_id : undefined,
      difficulty_level: filters.difficulty_level
        ? { in: filters.difficulty_level.split(',') as QuestionsPayload['difficulty_level'][] }
        : undefined,
      question: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
    };
    if (filters.technology_id) {
      return prisma.technology.findUnique({
        where: {
          id: filters.technology_id,
        },
        include: {
          questions: {
            where: { ...query },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });
    }
    return prisma.questions.findMany({ include: { technology: true } });
  }

  async getQuestionById(id: string): Promise<Questions | null> {
    return prisma.questions.findUnique({ where: { id } });
  }

  async createQuestion(data: QuestionsPayload): Promise<Questions> {
    return prisma.questions.create({ data });
  }
  async deleteQuestion(questionId: string) {
    return prisma.questions.delete({
      where: {
        id: questionId,
      },
    });
  }
  async updateQuestion(id: string, data: QuestionsPayload) {
    return prisma.questions.update({ where: { id }, data });
  }

  async getQuestionByTechnologyId(filters: {
    technology_id?: string;
    page?: string;
    limit?: string;
    difficulty_level?: string;
    search?: string;
  }) {
    const query: Prisma.QuestionsWhereInput = {
      technology_id: filters.technology_id ? filters.technology_id : undefined,
      difficulty_level: filters.difficulty_level
        ? { in: filters.difficulty_level.split(',') as QuestionsPayload['difficulty_level'][] }
        : undefined,
      question: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
      deleted_at: null,
    };

    const totalQuestions = await prisma.questions.count({
      where: { ...query },
    });
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || totalQuestions;

    const questions = await prisma.questions.findMany({
      where: { ...query },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(
      totalQuestions / (filters.limit ? Number(filters.limit) : totalQuestions)
    );
    const technology = await prisma.technology.findUnique({ where: { id: filters.technology_id } });
    return {
      list: questions,
      total: totalQuestions,
      page,
      limit,
      totalPages,
      technology,
    };
  }
}

export default QuestionService;
