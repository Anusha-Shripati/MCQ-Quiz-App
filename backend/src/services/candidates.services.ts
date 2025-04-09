import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class CandidatesService {
	async createCandidate(data: any) {
		return await prisma.candidate.create({
			data,
			include: {
				assessment: true,
				candidate_assessments: true,
				results: true,
			},
		});
	}

	async updateCandidate(id: string, data: any) {
		return await prisma.candidate.update({
			where: { id },
			data,
			include: {
				assessment: true,
				candidate_assessments: true,
				results: true,
			},
		});
	}

	async deleteCandidate(id: string) {
		return await prisma.candidate.delete({
			where: { id },
		});
	}

	async getCandidates(search: any) {
		const where: any = {};

		if (search.name) {
			where.name = {
				contains: search.name,
				mode: 'insensitive',
			};
		}

		if (search.email) {
			where.email = {
				contains: search.email,
				mode: 'insensitive',
			};
		}

		if (search.assessment_id) {
			where.assessment_id = search.assessment_id;
		}

		return await prisma.candidate.findMany({
			where,
			include: {
				assessment: true,
				candidate_assessments: true,
				results: true,
			},
			orderBy: {
				created_at: 'desc',
			},
		});
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
