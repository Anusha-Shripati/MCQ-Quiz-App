import { Difficulty, Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../common/errors/AppError';

const prisma = new PrismaClient();

interface CreateExamData {
  user_id: string;
  assessment_id: string;
  start_time: Date;
  end_time: Date;
  is_completed?: boolean;
  meta?: any;
}

export default class ExamService {
  async createExamQuestionsForAssessment(examId: string, assessmentId: string) {
    const assessment = await prisma.assessments.findUnique({
      where: { id: assessmentId, deleted_at: null },
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    console.log('aseessment technologies', assessment.technologies);
    for (const tech of assessment.technologies) {
      const easyQuestions = await this.getRandomQuestions('easy', tech.easy, tech.technology_id);
      const mediumQuestions = await this.getRandomQuestions(
        'medium',
        tech.medium,
        tech.technology_id
      );
      const hardQuestions = await this.getRandomQuestions('hard', tech.hard, tech.technology_id);

      const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

      await Promise.all(
        allQuestions.map((question) =>
          prisma.exam_questions.create({
            data: {
              exam: {
                connect: { id: examId },
              },
              question: {
                connect: { id: question.id },
              },
            },
          })
        )
      );
    }
  }

  async startExam(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'in_progress',
        start_time: new Date(),
      },
    });

    return updatedExam;
  }

  // async submitExam(examId: string, submission: ExamSubmission) {
  //   const exam = await prisma.exam.findUnique({
  //     where: { id: examId }
  //   });

  //   if (!exam) {
  //     throw new AppError("Exam not found", 404);
  //   }

  //   // Save exam answers
  //   const answers = await prisma.answers.createMany({
  //     data: Object.entries(submission.answers).map(([questionId, answer]) => ({
  //       exam_id: examId,
  //       question_id: questionId,
  //       answer: answer
  //     }))
  //   });

  //   // Save violations if any
  //   if (submission.violations.length > 0) {
  //     await prisma.violations.createMany({
  //       data: submission.violations.map(violation => ({
  //         exam_id: examId,
  //         type: violation.type,
  //         timestamp: new Date(violation.timestamp),
  //         details: violation.details
  //       }))
  //     });
  //   }

  //   // Save screenshots
  //   if (submission.screenshots.length > 0) {
  //     await prisma.screenshots.createMany({
  //       data: submission.screenshots.map(screenshot => ({
  //         exam_id: examId,
  //         timestamp: new Date(screenshot.timestamp),
  //         image_data: screenshot.image
  //       }))
  //     });
  //   }

  //   // Update exam status to completed
  //   const updatedExam = await prisma.exam.update({
  //     where: { id: examId },
  //     data: {
  //       status: 'COMPLETED',
  //       completed_at: new Date()
  //     }
  //   });

  //   return {
  //     examId: updatedExam.id,
  //     status: updatedExam.status,
  //     answersSubmitted: answers.count
  //   };
  // }

  async createExam(data: CreateExamData) {
    try {
      const assessment = await prisma.assessments.findUnique({
        where: { id: data.assessment_id },
        include: {
          technologies: {
            include: {
              technology: true,
            },
          },
        },
      });

      if (!assessment) {
        throw new AppError('Assessment not found', 404);
      }

      const exam = await prisma.exam.create({
        data: {
          user: {
            connect: {
              id: data.user_id,
            },
          },
          assessment: {
            connect: {
              id: data.assessment_id,
            },
          },
          end_time: data.end_time,
          start_time: data.start_time,
          is_completed: data.is_completed || false,
          meta: data.meta as Prisma.JsonObject,
        },
        include: {
          user: true,
          assessment: true,
          exam_questions: true,
          results: true,
          answers: true,
        },
      });

      await this.createExamQuestionsForAssessment(exam.id, data.assessment_id);

      return await prisma.exam.findUnique({
        where: { id: exam.id },
        include: {
          user: true,
          assessment: true,
          results: true,
          answers: true,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create exam with questions', 500);
    }
  }

  async getRandomQuestions(difficulty: Difficulty, count: number, technologyId: string) {
    const questions = await prisma.questions.findMany({
      where: {
        technology_id: technologyId,
        difficulty_level: difficulty,
      },
    });

    if (questions.length < count) {
      throw new AppError(`Not enough ${difficulty} questions available for this technology`, 400);
    }

    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async updateExam(id: string, data: any) {
    return await prisma.exam.update({
      where: { id },
      data: {
        ...(data.user_id && {
          user: {
            connect: {
              id: data.user_id,
            },
          },
        }),
        ...(data.assessment_id && {
          assessment: {
            connect: {
              id: data.assessment_id,
            },
          },
        }),
        end_time: data.end_time,
        start_time: data.start_time,
        is_completed: data.is_completed,
        meta: data.meta,
      },
      include: {
        user: true,
        assessment: true,
        exam_questions: true,
        results: true,
        answers: true,
      },
    });
  }

  async deleteExam(id: string) {
    return await prisma.exam.delete({
      where: { id },
    });
  }

  async getExams(search: any) {
    const where: any = {};

    if (search.user_id) {
      where.user_id = search.user_id;
    }

    if (search.assessment_id) {
      where.assessment_id = search.assessment_id;
    }

    if (search.is_completed !== undefined) {
      where.is_completed = search.is_completed;
    }

    return await prisma.exam.findMany({
      where,
      include: {
        user: true,
        assessment: true,
        exam_questions: true,
        results: true,
        answers: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getExamById(id: string) {
    return await prisma.exam.findUnique({
      where: { id },
      include: {
        user: true,
        assessment: true,
        exam_questions: true,
        results: true,
        answers: true,
      },
    });
  }

  async generateExamQuestions(examId: string, technologyId: string) {
    try {
      // Get the exam and its assessment details
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          assessment: true,
        },
      });

      if (!exam) {
        throw new AppError('Exam not found', 404);
      }

      const { assessment } = exam;
      const { easy, medium, hard } = assessment;

      const easyQuestions = await this.getRandomQuestions('easy', easy, technologyId);
      const mediumQuestions = await this.getRandomQuestions('medium', medium, technologyId);
      const hardQuestions = await this.getRandomQuestions('hard', hard, technologyId);

      // Combine all questions
      const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

      // Create exam questions
      const examQuestions = await Promise.all(
        allQuestions.map((question) =>
          prisma.exam_questions.create({
            data: {
              exam: {
                connect: { id: examId },
              },
              question: {
                connect: { id: question.id },
              },
            },
          })
        )
      );

      return examQuestions;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to generate exam questions', 500);
    }
  }
}
