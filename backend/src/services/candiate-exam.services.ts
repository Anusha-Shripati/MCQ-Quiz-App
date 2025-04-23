import { AppError } from '../common/errors/AppError';
import { prisma } from '../db/prisma.client';

export class CandidateExamService {
  async validateCandidateAccess(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { exam: true },
    });

    if (!candidate) throw new AppError('Candidate not found', 404);
    if (!candidate.exam_id) throw new AppError('No exam assigned', 400);

    return candidate;
  }

  async getExam(examId: string, candidateId: string) {
    const candidate = await this.validateCandidateAccess(candidateId);

    if (candidate.exam_id !== examId) {
      throw new AppError('Candidate does not have access to this exam', 403);
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
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
        exam_questions: {
          include: { question: true },
        },
      },
    });

    if (!exam) throw new AppError('Exam not found', 404);

    return exam;
  }

  async startExam(examId: string, candidateId: string) {
    const candidate = await this.validateCandidateAccess(candidateId);

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

    return {
      exam: updatedExam,
      firstQuestion: updatedExam.exam_questions[0].question,
    };
  }

  async getNextQuestion(examId: string, candidateId: string, currentQuestionId?: string) {
    await this.validateCandidateAccess(candidateId);

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

  // async submitAnswer(
  // 	examId: string,
  // 	candidateId: string,
  // 	questionId: string,
  // 	answer: string
  // ) {
  // 	await this.validateCandidateAccess(candidateId);

  // 	// Check if question exists in exam
  // 	const examQuestion = await prisma.exam_questions.findUnique({
  // 		where: {
  // 			exam_id_question_id: {
  // 				exam_id: examId,
  // 				question_id: questionId,
  // 			},
  // 		},
  // 	});

  // 	if (!examQuestion) {
  // 		throw new AppError('Question not found in this exam', 404);
  // 	}

  // 	await prisma.answers.create({
  // 		data: {
  // 			exam_id: examId,
  // 			question_id: questionId,
  // 			user_answer: answer,
  // 		},
  // 	});

  // 	// Get next question
  // 	return this.getNextQuestion(examId, candidateId, questionId);
  // }

  // async finishExam(examId: string, candidateId: string) {
  // 	const candidate = await this.validateCandidateAccess(candidateId, examId);

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
    const candidate = await this.validateCandidateAccess(candidateId);

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
      startTime: candidate.exam.start_time,
      endTime: candidate.exam.end_time,
      progress: `${answeredQuestions}/${totalQuestions}`,
      isCompleted: candidate.exam.is_completed,
    };
  }
}
