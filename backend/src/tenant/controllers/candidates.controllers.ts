import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError';
import CandidatesService from '../services/candidates.services';
import ExamService from '../services/exam.services';
import { CreateCandidate, UpdateCandidate } from '../../types/candidate.types';
import { generateResponse } from '../../utils/generateResponse';
import { Candidate } from '@prisma/client';
import { ExamMeta } from '../services/candiate-exam.services';
import { UsageService } from '../../platform/services/usage.service';
import { UsageMetric } from '../../db/prisma/generated/client';
import { getPrisma } from '../../db/prisma/client';

export class CandidateController {
  private usageService: UsageService;

  constructor() {
    this.usageService = new UsageService(getPrisma());
  }
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateData: CreateCandidate = req.body;
      const user = req.user!;
      const examService = new ExamService(req.context!.prisma);
      const candidateService = new CandidatesService(req.context!.prisma);

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
        created_by: req.user?.id || ''
      });

      await this.usageService.incrementUsage(req.context!.tenant!.id, UsageMetric.candidates);

      return generateResponse(res, 201, newCandidate, true, 'Candidate created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const candidateData: UpdateCandidate = req.body;
      const user = req.user!;
      const candidateService = new CandidatesService(req.context!.prisma);
      const examService = new ExamService(req.context!.prisma);

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
  resetAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const candidateService = new CandidatesService(req.context!.prisma);
      
      const candidate = await candidateService.getCandidateById(id)
      const exam = await req.context!.prisma.exam.findFirst({where:{id}}) 
      await req.context!.prisma.exam.update({
        where: { id: (candidate as Candidate).exam_id },
        data: { status: "pending",is_completed:false,meta:{...((exam?.meta as ExamMeta) || {}),violations:[],screenshots:[],camera:[] } }
      });
      await req.context!.prisma.results.deleteMany({where:{candidate_id:id}})
      await req.context!.prisma.answers.deleteMany({
        where: {  candidate_id: id },
      });
    return generateResponse(res, 200, {}, true, 'Candidate updated successfully');
  } catch(error) {
    next(error);
  }
};

delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const candidateService = new CandidatesService(req.context!.prisma);
    
    const existingCandidate = await candidateService.getCandidateById(id);
    if (!existingCandidate) {
      return generateResponse(res, 404, {}, false, 'Candidate not found!');
    }

    await candidateService.deleteCandidate(id);
    // Removed decrementUsage call - usage tracks creation limits per period

    return generateResponse(res, 200, {}, true, 'Candidate deleted successfully');
  } catch (error) {
    next(error);
  }
};

get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const candidateService = new CandidatesService(req.context!.prisma);
    
    const candidates = await candidateService.getCandidates(query);
    return generateResponse(res, 200, candidates, true, 'Candidates fetched successfully');
  } catch (error) {
    next(error);
  }
};

getCandidateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const candidateService = new CandidatesService(req.context!.prisma);
    
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
