import { Difficulty, Prisma, PrismaClient, Questions } from '../../db/tenant/generated/client';
import { AppError } from '../../common/errors/AppError';

interface CreateExamData {
  user_id: string;
  assessment_id: string;
  start_time: Date;
  end_time: Date;
  is_completed?: boolean;
  meta?: any;
}

export default class ExamService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createExamQuestionsForAssessment(examId: string, assessmentId: string) {
    const assessment = await this.prisma.assessments.findUnique({
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

    for (const tech of assessment.technologies) {
      let easyQuestions: Questions[] = [];
      let mediumQuestions: Questions[] = [];
      let hardQuestions: Questions[] = [];
      try {
        easyQuestions = await this.getRandomQuestions('easy', tech.easy as Record<Questions['type'], number>, tech.technology_id);
        mediumQuestions = await this.getRandomQuestions('medium', tech.medium as Record<Questions['type'], number>, tech.technology_id);
        hardQuestions = await this.getRandomQuestions('hard', tech.hard as Record<Questions['type'], number>, tech.technology_id);
      } catch (err) {
        if (err instanceof AppError) {
          throw err;
        }
        throw new AppError('Unexpected error while fetching questions', 500);
      }

      const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

      await Promise.all(
        allQuestions.map((question) =>
          this.prisma.exam_questions.create({
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
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const updatedExam = await this.prisma.exam.update({
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
      const assessment = await this.prisma.assessments.findUnique({
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

      const exam = await this.prisma.exam.create({
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

      return exam;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create exam with questions', 500);
    }
  }

  async getRandomQuestions(difficulty: Difficulty, type: Record<Questions['type'], number>, technologyId: string) {
    let arr: Questions[] = [];
    for (const [key, value] of Object.entries(type).filter(([key]) => key !== 'total')) {
      const questions = await this.prisma.questions.findMany({
        where: {
          technology_id: technologyId,
          difficulty_level: difficulty,
          type: key as Questions['type'],
        },
      });

      if (questions.length < value) {
        if(questions.length) throw new AppError( `Not enough ${difficulty} questions available for this technology: only ${questions.length} question(s) found for "${key}".`, 400);
        throw new AppError( `No ${difficulty} questions available for this technology for "${key}".`, 400);
      }

      const shuffled = questions.sort(() => 0.5 - Math.random());
      arr = [...arr, ...shuffled.slice(0, value)];
    }
    return arr;
  }

  async updateExam(id: string, data: any) {
    return await this.prisma.exam.update({
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
        status:"pending"
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
    return await this.prisma.exam.delete({
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

    return await this.prisma.exam.findMany({
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
    return await this.prisma.exam.findUnique({
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
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        assessment: {
          include: {
            technologies: {
              where: {
                id: technologyId,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const { assessment } = exam;
    const { easy, medium, hard } = assessment.technologies[0];

    let easyQuestions: Questions[] = [];
    let mediumQuestions: Questions[] = [];
    let hardQuestions: Questions[] = [];
    try {
      easyQuestions = await this.getRandomQuestions('easy', easy as Record<Questions['type'], number>, technologyId);
      mediumQuestions = await this.getRandomQuestions('medium', medium as Record<Questions['type'], number>, technologyId);
      hardQuestions = await this.getRandomQuestions('hard', hard as Record<Questions['type'], number>, technologyId);
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Unexpected error while fetching questions', 500);
    }

    // Combine all questions
    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

    // Create exam questions
    const examQuestions = await Promise.all(
      allQuestions.map((question) =>
        this.prisma.exam_questions.create({
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
  }
}
