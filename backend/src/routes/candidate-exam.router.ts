import express from 'express';
import { CandidateExamController } from '../controllers/candidate-exam.controllers';
import { validateRequest } from '../middlewares/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateCandidate } from '../middlewares/auth.middleware';
import { prisma } from '../db/prisma.client';
import { CandidateExamService } from '../services/candiate-exam.services';
import { candidateExamSchema } from '../validationSchemas/candidate-exam.validations';

const router = express.Router();
const candidateExamService = new CandidateExamService();
const candidateExamController = new CandidateExamController(
	candidateExamService
);

router.post(
	'/:examId/start',
	authenticateCandidate,
  validateRequest(candidateExamSchema.startExam),
	asyncHandler(candidateExamController.startExam)
);

router.get(
	'/:examId',
	authenticateCandidate,
  validateRequest(candidateExamSchema.get),
	asyncHandler(candidateExamController.getExam)
);

router.get(
	'/:examId/next-question',
	authenticateCandidate,
	asyncHandler(candidateExamController.getNextQuestion)
);

router.post(
	'/:examId/questions/:questionId/answer',
	authenticateCandidate,
	asyncHandler(candidateExamController.submitAnswer)
);

router.post(
	'/:examId/finish',
	authenticateCandidate,
	asyncHandler(candidateExamController.finishExam)
);

router.get(
	'/:examId/status',
	authenticateCandidate,
	asyncHandler(candidateExamController.getExamStatus)
);

export default router;
