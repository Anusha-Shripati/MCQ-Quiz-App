import { PrismaClient, Difficulty } from '@prisma/client';
import { Exam } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
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
			where: { id: assessmentId },
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
			const easyQuestions = await this.getRandomQuestions(
				tech.technology_id,
				tech.technology.name,
				'easy',
				tech.easy
			);
			const mediumQuestions = await this.getRandomQuestions(
				tech.technology_id,
				tech.technology.name,
				'medium',
				tech.medium
			);
			const hardQuestions = await this.getRandomQuestions(
				tech.technology_id,
				tech.technology.name,
				'hard',
				tech.hard
			);

			const allQuestions = [
				...easyQuestions,
				...mediumQuestions,
				...hardQuestions,
			];

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

	async getRandomQuestions(
		technologyId: string,
		technologyName: string,
		difficulty: Difficulty,
		count: number
	) {
		const questions = await prisma.questions.findMany({
			where: {
				technology_id: technologyId,
				difficulty_level: difficulty,
			},
		});

		if (questions.length < count) {
			throw new AppError(
				`Not enough ${difficulty} questions available for technology ${technologyName}`,
				400
			);
		}

		// Shuffle and select random questions
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

			// Function to get random questions for a specific difficulty
			const getRandomQuestions = async (
				difficulty: Difficulty,
				count: number
			) => {
				const questions = await prisma.questions.findMany({
					where: {
						technology_id: technologyId,
						difficulty_level: difficulty,
					},
				});

				if (questions.length < count) {
					throw new AppError(
						`Not enough ${difficulty} questions available for this technology`,
						400
					);
				}

				// Shuffle and select random questions
				const shuffled = questions.sort(() => 0.5 - Math.random());
				return shuffled.slice(0, count);
			};

			// Get questions for each difficulty level
			const easyQuestions = await getRandomQuestions('easy', easy);
			const mediumQuestions = await getRandomQuestions('medium', medium);
			const hardQuestions = await getRandomQuestions('hard', hard);

			// Combine all questions
			const allQuestions = [
				...easyQuestions,
				...mediumQuestions,
				...hardQuestions,
			];

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
