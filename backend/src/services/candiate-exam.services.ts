import { Answers, Questions } from '@prisma/client';
import { AppError } from '../common/errors/AppError';
import { prisma } from '../db/prisma.client';
import { UploadService } from './upload.services';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';
import nodemailer from 'nodemailer';
import { UploadedFile } from '../types/upload.types';
interface Violation {
  type: string;
  timestamp: number;
  details: string;
}

export interface ExamMeta {
  violations?: Violation[];
  [key: string]: any;
}
type AnswerWithQuestion = Answers & { question: Questions | null, score?: Decimal };
export class CandidateExamService {
  private uploadService;
  constructor() {
    this.uploadService = new UploadService();
  }
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
        answers: {
          where: {
            ...(examId ? { exam_id: examId } : {}),
            question_name: 'introduction',
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
      select: {
        id: true,
        end_time: true,
        start_time: true,
        status: true,
        candidate: true,
        meta: true,
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
              },
            },
            duration: true,
          },
        },
        answers: {
          where: {
            question_id: {
              not: null,
            },
          },
          select: {
            id: true,
            question_id: true,
            question_name: true,
            user_answer: true,
          },
        },
        exam_questions: {
          include: {
            question: {
              select: {
                difficulty_level: true,
                options: true,
                type: true,
                time: true,
                meta: true,
                technology: true,
                question: true,
              },
            },
          },
        },
      },
    });

    // Filter out empty string options from questions
    if (exam?.exam_questions) {
      exam.exam_questions = exam.exam_questions.map((examQuestion) => {
        if (examQuestion.question?.options && Array.isArray(examQuestion.question.options)) {
          examQuestion.question.options = examQuestion.question.options.filter(
            (option) => option !== '' && option !== null
          );
        }
        return examQuestion;
      });
    }

    let violations = 0;
    if (exam?.meta && Array.isArray((exam?.meta as JsonObject)?.violations)) {
      violations = ((exam?.meta as JsonObject)?.violations as { name: string }[]).length;
    }
    if (!exam) throw new AppError('Exam not found', 404);
    const { meta, ...rest } = exam;
    return { ...rest, violations };
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

    return updatedExam;
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
    data: { question_id?: string; user_answer: string[]; question_name: string | null }
  ) {
    let result = {
      score: 0,
      weight: 0,
    };
    if (data.question_id) {
      const examQuestion = await prisma.exam_questions.findFirst({
        where: {
          exam_id: exam_id,
          question_id: data.question_id,
        },
        include: {
          question: true,
        },
      });
      if (!examQuestion) {
        throw new AppError('Question not found in this exam', 404);
      }
      const { difficulty_level, correct_answer, type } = examQuestion.question;

      const weight = difficulty_level === 'easy' ? 1 : difficulty_level === 'medium' ? 2 : 3;

      result.score = 0;
      result.weight = weight;
      const userAns = data.user_answer;

      if (Array.isArray(correct_answer) && Array.isArray(userAns) && correct_answer.length) {
        if (type == 'multiple_select') {
          const correctCount = userAns.filter((ans) => correct_answer.includes(ans)).length;
          const falseCount = userAns.length - correctCount;
          const score = ((correctCount - falseCount) * weight) / correct_answer.length;
          result.score = score > 0 ? score : 0;
        } else {
          result.score = correct_answer[0] == userAns[0] ? weight : 0;
        }
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
      const newAns = await prisma.answers.update({
        where: { id: ans.id },
        data: {
          user_answer: data.user_answer,
          question_name: data.question_name,
          ...result,
        },
      });
      return {
        id: newAns.id,
        user_answer: newAns.user_answer,
      };
    }

    const newAns = await prisma.answers.create({
      data: {
        exam_id: exam_id,
        question_id: data.question_id || null,
        candidate_id: candidate_id,
        user_answer: data.user_answer,
        question_name: data.question_name || null,
        ...result,
      },
    });
    return {
      id: newAns.id,
      user_answer: newAns.user_answer,
    };
  }

  async resetAnswer(answer_id?: string) {
    try {
      await prisma.answers.delete({
        where: {
          id: answer_id,
        },
      });
      return null;
    } catch (error) {
      throw new Error('Please try again after a few moments. The video might still be uploading');
    }
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
  async finishExam(examId: string, candidateId: string) {
    try {
      const { total, score, tech_score } = await this.resultCalculation(examId);

      const result = await prisma.results.upsert({
        where: {
          exam_id: examId,
          candidate_id: candidateId,
        },
        update: {
          score,
          total,
          percentage: ((score || 0) * 100) / (total || 1),
        },
        create: {
          score,
          total,
          percentage: ((score || 0) * 100) / (total || 1),
          candidate_id: candidateId,
          exam_id: examId,
        },
      });
      const exam = await prisma.exam.findFirst({ where: { id: examId } });
      const updatedMeta: ExamMeta = {
        ...((exam?.meta as ExamMeta) || {}),
        tech_score: tech_score,
      };

      const [, returnValue] = await prisma.$transaction([
        prisma.answers.updateMany({ where: { exam_id: examId }, data: { result_id: result.id } }),
        prisma.exam.update({
          where: { id: examId },
          data: {
            status: 'completed',
            end_time: new Date(),
            is_completed: true,
            meta: updatedMeta,
          },
        }),
      ]);
      return returnValue;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async resultCalculation(examId: string) {
    // Fetch all questions with their difficulty
    const allQuestions = await prisma.exam_questions.findMany({
      where: { exam_id: examId },
      include: { question: true },
    });

    // Fetch all answers
    const answers = await prisma.answers.findMany({
      where: { exam_id: examId, question_id: { not: null } },
      include: { question: true },
    });

    const obj = { score: 0, total: 0 };
    let tech_score: {
      technology_id: string;
      score: number;
      total: number;
      percentage: number;
    }[] = [];

    allQuestions.forEach(({ question }) => {
      if (!question) return;

      const weight =
        question.difficulty_level === 'easy' ? 1 : question.difficulty_level === 'medium' ? 2 : 3;

      obj.total += weight;

      // Check if candidate has answered this question
      const answer = answers.find((a) => a.question_id === question.id);
      const score = answer?.score || 0;
      obj.score += score;

      // Update technology-wise score
      const techEntry = tech_score.find((t) => t.technology_id === question.technology_id);
      if (!techEntry) {
        tech_score.push({
          technology_id: question.technology_id,
          score,
          total: weight,
          percentage: (score * 100) / weight,
        });
      } else {
        techEntry.score += score;
        techEntry.total += weight;
        techEntry.percentage = (techEntry.score * 100) / techEntry.total;
      }
    });

    return { ...obj, tech_score };
  }

  async submitViolation(examId: string, data: { violations: Violation[] }) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { meta: true },
    });
    const updatedMeta: ExamMeta = {
      ...((exam?.meta as ExamMeta) || {}),
      violations: [
        ...(((exam?.meta as ExamMeta)?.violations ?? []) as any[]),
        ...(data.violations ?? []),
      ],
    };

    if (!exam) throw new AppError('Exam not found', 404);
    await prisma.exam.update({
      where: { id: examId },
      data: {
        meta: updatedMeta,
      },
    });
  }

  async saveSnapshot(
    examId: string,
    file: Express.Multer.File,
    { timestamp, fileType }: { timestamp: number; fileType: 'screenshot' | 'camera' }
  ) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { meta: true },
    });
    if (!exam) throw new AppError('Exam not found', 404);
    let updatedMeta: ExamMeta;
    const uploadedFile = await this.uploadService.processFile(file);

    if (fileType == 'screenshot') {
      updatedMeta = {
        ...((exam?.meta as ExamMeta) || {}),
        screenshots: [
          ...((exam?.meta as ExamMeta)?.screenshots || []),
          { timestamp: timestamp, image: uploadedFile.path },
        ],
      };
    } else {
      updatedMeta = {
        ...((exam?.meta as ExamMeta) || {}),
        camera: [
          ...((exam?.meta as ExamMeta)?.camera || []),
          { timestamp: timestamp, image: uploadedFile.path },
        ],
      };
    }
    await prisma.exam.update({
      where: { id: examId },
      data: {
        meta: updatedMeta,
      },
    });
    return uploadedFile;
  }

  async saveIntegrityEvidence(
    examId: string,
    file: Express.Multer.File,
    { 
      timestamp, 
      fileType, 
      eventType, 
      headPose, 
      duration 
    }: { 
      timestamp: number; 
      fileType: 'screenshot' | 'camera';
      eventType?: string;
      headPose?: string;
      duration?: string;
    }
  ) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { meta: true },
    });
    if (!exam) throw new AppError('Exam not found', 404);

    const uploadedFile = await this.uploadService.processFile(file);

    let parsedHeadPose;
    try {
      parsedHeadPose = headPose ? JSON.parse(headPose) : undefined;
    } catch (e) {
      parsedHeadPose = undefined;
    }

    const evidenceEntry = {
      timestamp: Number(timestamp),
      image: uploadedFile.path,
      eventType: eventType || 'lookAway',
      headPose: parsedHeadPose,
      duration: duration ? parseInt(duration) : undefined,
    };

    const currentMeta = (exam?.meta as ExamMeta) || {};
    const integrityEvidence = (currentMeta.integrityEvidence as any) || {
      camera: [],
      screenshot: [],
    };

    if (fileType === 'screenshot') {
      integrityEvidence.screenshot = [...(integrityEvidence.screenshot || []), evidenceEntry];
    } else {
      integrityEvidence.camera = [...(integrityEvidence.camera || []), evidenceEntry];
    }

    const updatedMeta: ExamMeta = {
      ...currentMeta,
      integrityEvidence,
    };

    await prisma.exam.update({
      where: { id: examId },
      data: {
        meta: updatedMeta,
      },
    });

    return uploadedFile;
  }

  async sendThankYouEmail(candidateId: string, examId: string) {
    const candidate = await this.getCandidate(candidateId, examId);
    if (!candidate.email) throw new AppError('Candidate email not found', 404);

    const exam = await this.getExam(examId, candidateId);

    if (!exam) throw new AppError('Exam not found', 404);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: 'Thank You for Completing the Exam',
    };
    const mailContent = `
      <h1>Thank You for Completing the Exam</h1>
      <p>Dear ${candidate.name || 'Candidate'},</p>
      <p>Thank you for taking the time to complete the exam. We appreciate your effort and dedication.</p>
      <p>We will review your performance and get back to you soon.</p>
      <p>Best regards,</p>
      <p>LR Exam Team</p>
    `;
    await transporter.sendMail(mailOptions);

    return true;
  }
  async saveVerifiedImage(examId: string, result: UploadedFile) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { verified_image: true },
    });
    if (!exam) throw new AppError('Exam not found', 404);
    await prisma.exam.update({
      where: { id: examId },
      data: {
        verified_image: result.path, // Save only the file path
      },
    });
    return result;
  }

  async submitFeedback(
    examId: string,
    candidateId: string,
    data: {
      experience_rating: number;
      question_clarity: string;
      difficulty: string;
      technical_issues: string;
      comments?: string;
    }
  ) {
    const candidate = await this.getCandidate(candidateId);
    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    try {
      // Check if feedback already exists
      const existingFeedback = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Candidate_feedback" 
        WHERE candidate_id = ${candidateId} AND exam_id = ${examId}
      `;

      if (existingFeedback && existingFeedback.length > 0) {
        // Update existing feedback
        await prisma.$executeRaw`
          UPDATE "Candidate_feedback"
          SET 
            experience_rating = ${data.experience_rating},
            question_clarity = ${data.question_clarity},
            difficulty = ${data.difficulty},
            technical_issues = ${data.technical_issues},
            comments = ${data.comments || null},
            updated_at = ${new Date()}
          WHERE id = ${existingFeedback[0].id}
        `;

        return {
          id: existingFeedback[0].id,
          ...data,
          updated: true,
        };
      }

      // Create new feedback
      const result = await prisma.$executeRaw`
        INSERT INTO "Candidate_feedback" 
        (id, candidate_id, exam_id, experience_rating, question_clarity, difficulty, technical_issues, comments, created_at, updated_at)
        VALUES (
          gen_random_uuid(), 
          ${candidateId}, 
          ${examId}, 
          ${data.experience_rating}, 
          ${data.question_clarity}, 
          ${data.difficulty}, 
          ${data.technical_issues}, 
          ${data.comments || null}, 
          ${new Date()}, 
          ${new Date()}
        )
      `;

      return {
        ...data,
        created: true,
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new AppError('Failed to submit feedback', 500);
    }
  }
}