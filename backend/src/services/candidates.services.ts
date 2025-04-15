import { Prisma, PrismaClient } from '@prisma/client';
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
				if (existingEmail) {
					throw new AppError('Email already exists', 400);
				}

				const existingPhone = await tx.candidate.findUnique({
					where: { phone: data.phone },
				});
				if (existingPhone) {
					throw new AppError('Phone number already exists', 400);
				}

				await examService.createExamQuestionsForAssessment(data.exam_id, data.assessment_id);

				const candidate = await tx.candidate.create({
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
						candidate_assessments: true,
						results: true,
					},
				});
				await tx.candidate_assessments.create({
					data: {
						assessment: {
							connect: { id: data.assessment_id },
						},
						candidate: {
							connect: { id: candidate.id },
						},
					},
				})
				return candidate
			});


			return result
		} catch (error) {
			console.log('error', error);
			if (error instanceof AppError) {
				throw error;
			}
			throw new AppError(
				'Failed to create candidate. Please try again later.',
				500
			);
		}
	}

	async updateCandidate(id: string, data: UpdateCandidate) {
		const result = await prisma.$transaction(async (tx) => {
			const existingCandidate = await tx.candidate.findUnique({
				where: { id },
				include: {
					assessment: true,
					candidate_assessments: true,
					results: true,
					exam: {
						include: {
							exam_questions: true
						}
					}
				},
			});

			if (!existingCandidate) {
				throw new AppError('Candidate not found', 404);
			}

			if (data.email && data.email !== existingCandidate.email) {
				const existingEmail = await tx.candidate.findUnique({
					where: { email: data.email },
				});

				if (existingEmail) {
					throw new AppError('Email already exists', 400);
				}
			}

			if (data.phone && data.phone !== existingCandidate.phone) {
				const existingPhone = await tx.candidate.findUnique({
					where: { phone: data.phone },
				});

				if (existingPhone) {
					throw new AppError('Phone number already exists', 400);
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
					where: { exam_id: existingCandidate.exam.id }
				});

				await examService.createExamQuestionsForAssessment(existingCandidate.exam.id, data.assessment_id);
			}

			return await tx.candidate.update({
				where: { id },
				data: {
					name: data.name,
					email: data.email,
					phone: data.phone,
					experience: data.experience,
					assessment_id: data.assessment_id,
					meta: data.meta as Prisma.JsonObject,
				},
				include: {
					assessment: true,
					candidate_assessments: true,
					results: true,
					exam: {
						include: {
							exam_questions: true
						}
					}
				},
			});
		})
		return result
	}

	async deleteCandidate(id: string) {
		return await prisma.candidate.delete({
			where: { id },
		});
	}

	async getCandidates(query: {
		created?: string;
		limit?: string;
		page?: string;
		search?: string;
		assessmentFilter?: string | string[];
	}) {
		const where: Prisma.CandidateWhereInput = {};


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
				console.log('Received created query:', query.created);
				const dateRange = JSON.parse(query.created)?.range;
				console.log('Parsed date range:', dateRange);

				if (!dateRange) {
					throw new AppError('Invalid date range format', 400);
				}

				const fromDate = dateRange.from ? new Date(dateRange.from) : null;
				const toDate = dateRange.to ? new Date(dateRange.to) : null;

				console.log('Converted dates:', {
					fromDate: fromDate,
					toDate: toDate,
				});

				if (
					fromDate &&
					toDate &&
					!isNaN(fromDate.getTime()) &&
					!isNaN(toDate.getTime())
				) {
					where.created_at = {
						gte: fromDate,
						lte: toDate,
					};
					console.log('Final where clause for dates:', where.created_at);
				} else {
					console.log('Invalid dates:', { fromDate, toDate });
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
				exam: true,
				candidate_assessments: {
					include: {
						assessment: true
					}
				},
				assessment:{
					include:{
						technologies:{
							include:{
								technology:true
							}
						}
					}
				},
				results: true,
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
		return await prisma.candidate.findUnique({
			where: { id },
			include: {
				assessment: true,
				candidate_assessments: true,
				results: true,
			},
		});
	}
}
