import { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/AppError';
import CandidatesService from '../services/candidates.services';
import ExamService from '../services/exam.services';
import { CreateCandidate, UpdateCandidate } from '../types/candidate.types';
import { generateResponse } from '../utils/generateResponse';

const candidateService = new CandidatesService();
const examService = new ExamService();

export class CandidateController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateData: CreateCandidate = req.body;
      const user = req.user;

      const newExam = await examService.createExam({
        user_id: user.id,
        assessment_id: candidateData.assessment_id,
        meta: candidateData.meta || {},
        start_time: candidateData.start_date || new Date(),
        end_time: candidateData.end_date || new Date(),
      });

      if (!newExam) {
        throw new AppError('Failed to create exam', 400);
      }

      const newCandidate = await candidateService.createCandidate({
        assessment_id: candidateData.assessment_id,
        technology_id: candidateData.technology_id,
        exam_id: newExam.id,
        name: candidateData.name,
        email: candidateData.email,
        experience: candidateData.experience,
        phone: candidateData.phone,
        meta: candidateData.meta || {},
        created_by:req.user?.id || ''
      });

      return generateResponse(res, 201, newCandidate, true, 'Candidate created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const candidateData: UpdateCandidate = req.body;
      const user = req.user;

      const existingCandidate = await candidateService.getCandidateById(id);

      if (!existingCandidate) {
        return generateResponse(res, 404, {}, false, 'Candidate not found!');
      }

      await examService.updateExam(existingCandidate.exam_id, {
        user_id: user.id,
        assessment_id: candidateData.assessment_id as string,
        meta: candidateData.meta || {},
        start_time: candidateData.start_date || new Date(),
        end_time: candidateData.end_date || new Date(),
      });
      const updatedCandidate = await candidateService.updateCandidate(id, candidateData);

      return generateResponse(res, 200, updatedCandidate, true, 'Candidate updated successfully');
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
      return generateResponse(res, 200, {}, true, 'Candidate deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const candidates = await candidateService.getCandidates(query);
      return generateResponse(res, 200, candidates, true, 'Candidates fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getCandidateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const candidate = await candidateService.getCandidateById(id);
      if (!candidate) {
        return generateResponse(res, 404, {}, false, 'Candidate not found!');
      }
      return generateResponse(res, 200, candidate, true, 'Candidate fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
