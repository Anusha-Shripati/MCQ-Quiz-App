import { AppError } from '../common/errors/AppError';
import { prisma } from '../db/prisma.client';


interface Violation {
  type: string;
  timestamp: number;
  details: string;
}

interface ExamMeta {
  violations?: Violation[];
  [key: string]: any;
}

export class CandidateExamService {
  async getCandidate(candidateId: string, examId?: string) {
    
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        exam: true, 
        assessment: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
        answers:{
          where: {
            ...(examId ? { exam_id: examId } : {}),
            question_name: "introduction"
          },
        },
      },
    });

    if (!candidate) throw new AppError('Candidate not found', 404);
    if (!candidate.exam_id) throw new AppError('No exam assigned', 400);

    return candidate;
  }

  async getExam(examId: string, candidateId: string) {
    const candidate = await this.getCandidate(candidateId);

    if (candidate.exam_id !== examId) {
      throw new AppError('Candidate does not have access to this exam', 403);
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
        assessment: {
          deleted_at: null,
        },
      },
      include: {
        candidate: true,
        assessment: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
        answers: {
          where:{
            question_id:{
              not:null
            }
          }
        },
        exam_questions: {
          include: { question: true },
        },
      },
    });

    if (!exam) throw new AppError('Exam not found', 404);

    return exam;
  }

  async startExam(examId: string, candidateId: string) {
    const candidate = await this.getCandidate(candidateId);

    if (candidate.exam.status !== 'pending') {
      throw new AppError(
        candidate.exam.status === 'completed'
          ? 'Exam already completed'
          : 'Exam already in progress',
        400
      );
    }

    // Get exam questions
    const examQuestions = await prisma.exam_questions.findMany({
      where: { exam_id: candidate.exam_id },
      include: { question: true },
    });

    if (examQuestions.length === 0) {
      throw new AppError('No questions found for this exam', 404);
    }

    // Start the exam
    const updatedExam = await prisma.exam.update({
      where: { id: candidate.exam_id },
      data: {
        start_time: new Date(),
        status: 'in_progress',
      },
      include: {
        exam_questions: {
          include: { question: true },
        },
      },
    });

    return updatedExam
  }

  async getNextQuestion(examId: string, candidateId: string, currentQuestionId?: string) {
    await this.getCandidate(candidateId);

    const whereClause: any = { exam_id: examId };
    if (currentQuestionId) {
      whereClause.question_id = { not: currentQuestionId };
    }

    const unansweredQuestions = await prisma.exam_questions.findMany({
      where: {
        ...whereClause,
        NOT: {
          question: {
            answers: {
              some: {
                exam_id: examId,
                candidate_id: candidateId,
              },
            },
          },
        },
      },
      include: { question: true },
    });

    if (unansweredQuestions.length === 0) return null;
    return unansweredQuestions[0].question;
  }

  async submitAnswer(
    exam_id: string,
    candidate_id: string,
    data: { question_id?: string; user_answer: string[], question_name: string },
  ) {
    await this.getCandidate(candidate_id);

    if (data.question_id) {
      const examQuestion = await prisma.exam_questions.findFirst({
        where: {
          exam_id: exam_id,
          question_id: data.question_id,
        },
      });
      if (!examQuestion) {
        throw new AppError('Question not found in this exam', 404);
      }

    }
    
    const ans = await prisma.answers.findFirst({
      where: {
        exam_id: exam_id,
        question_id: data.question_id,
        candidate_id: candidate_id,
        question_name: data.question_name,
      },
    });
    if (ans) {
      return await prisma.answers.update({
        where: { id: ans.id },
        data: {
          user_answer: data.user_answer,
          question_name: data.question_name,
        },
      });
    }

    return await prisma.answers.create({
      data: {
        exam_id: exam_id,
        question_id: data.question_id || null,
        candidate_id: candidate_id,
        user_answer: data.user_answer,
        question_name: data.question_name || null,
      },
    });
  }

  // async finishExam(examId: string, candidateId: string) {
  // 	const candidate = await this.getCandidate(candidateId, examId);

  // 	if (candidate.exam.status === 'completed') {
  // 		throw new AppError('Exam already completed', 400);
  // 	}

  // 	// Calculate score
  // 	const answers = await prisma.answers.findMany({
  // 		where: {
  // 			exam_id: examId,
  // 			candidate_id: candidateId,
  // 		},
  // 		include: { question: true },
  // 	});

  // 	const correctAnswers = answers.filter(
  // 		(a) => a.user_answer === a.question.correct_answer
  // 	).length;

  // 	const totalQuestions = await prisma.exam_questions.count({
  // 		where: { exam_id: examId },
  // 	});

  // 	const score = (correctAnswers / totalQuestions) * 100;

  // 	// Create result
  // 	const result = await prisma.results.create({
  // 		data: {
  // 			exam_id: examId,
  // 			candidate_id: candidateId,
  // 			score: score,
  // 		},
  // 	});

  // 	// Mark exam as completed
  // 	await prisma.exam.update({
  // 		where: { id: examId },
  // 		data: {
  // 			end_time: new Date(),
  // 			status: 'completed',
  // 			is_completed: true,
  // 		},
  // 	});

  // 	return {
  // 		result,
  // 		score,
  // 		totalQuestions,
  // 		correctAnswers,
  // 	};
  // }

  async getExamStatus(examId: string, candidateId: string) {
    const candidate = await this.getCandidate(candidateId);

    const answeredQuestions = await prisma.answers.count({
      where: {
        exam_id: examId,
        candidate_id: candidateId,
      },
    });

    const totalQuestions = await prisma.exam_questions.count({
      where: { exam_id: examId },
    });

    return {
      examId,
      status: candidate.exam.status,
      start_time: candidate.exam.start_time,
      end_time: candidate.exam.end_time,
      progress: `${answeredQuestions}/${totalQuestions}`,
      isCompleted: candidate.exam.is_completed,
    };
  }
  async finishExam(examId: string) {
    await prisma.exam.update({
      where: { id: examId },
      data: { status: 'completed', end_time: new Date(),is_completed: true },
    });
  }

  async submitViolation(examId: string, data: { violations: Violation[] }) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { meta: true },
    });
    const updatedMeta: ExamMeta = {
      ...(exam?.meta as ExamMeta || {}),
      violations: [...((exam?.meta as ExamMeta)?.violations || []), ...data.violations],
    };

    if (!exam) throw new AppError('Exam not found', 404);
    await prisma.exam.update({
      where: { id: examId },
      data: {
        meta: updatedMeta,
      },
    });
  }

  async saveScreenshot(examId: string, file: Express.Multer.File,timestamp:number) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { meta: true },
    });
    if (!exam) throw new AppError('Exam not found', 404);
    const updatedMeta: ExamMeta = {
      ...(exam?.meta as ExamMeta || {}),
      screenshots :[...(exam?.meta as ExamMeta)?.screenshots || [],{timestamp:timestamp,image:file.path}]
    };
    await prisma.exam.update({
      where: { id: examId },
      data: {
        meta: updatedMeta,
      },
    });
  }
}
