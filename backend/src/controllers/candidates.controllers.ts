import { Request, Response, NextFunction } from 'express';
import CandidatesService from '../services/candidates.services';
import { generateResponse } from '../utils/generateResponse';

const candidateService = new CandidatesService();

export class CandidateController {
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const candidateData = req.body;
			const newCandidate =
				await candidateService.createCandidate(candidateData);
			return generateResponse(
				res,
				201,
				newCandidate,
				true,
				'Candidate created successfully'
			);
		} catch (error) {
			next(error);
		}
	};

	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const candidateData = req.body;

			const existingCandidate = await candidateService.getCandidateById(id);
			if (!existingCandidate) {
				return generateResponse(res, 404, {}, false, 'Candidate not found!');
			}

			const updatedCandidate = await candidateService.updateCandidate(
				id,
				candidateData
			);
			return generateResponse(
				res,
				200,
				updatedCandidate,
				true,
				'Candidate updated successfully'
			);
		} catch (error) {
			next(error);
		}
	};

	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const existingCandidate = await candidateService.getCandidateById(id);
			if (!existingCandidate) {
				return generateResponse(res, 404, {}, false, 'Candidate not found!');
			}

			await candidateService.deleteCandidate(id);
			return generateResponse(
				res,
				200,
				{},
				true,
				'Candidate deleted successfully'
			);
		} catch (error) {
			next(error);
		}
	};

	get = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const search = req.query;
			const candidates = await candidateService.getCandidates(search);
			return generateResponse(
				res,
				200,
				candidates,
				true,
				'Candidates fetched successfully'
			);
		} catch (error) {
			next(error);
		}
	};

	getCandidateById = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { id } = req.params;
			const candidate = await candidateService.getCandidateById(id);
			if (!candidate) {
				return generateResponse(res, 404, {}, false, 'Candidate not found!');
			}
			return generateResponse(
				res,
				200,
				candidate,
				true,
				'Candidate fetched successfully'
			);
		} catch (error) {
			next(error);
		}
	};
}
