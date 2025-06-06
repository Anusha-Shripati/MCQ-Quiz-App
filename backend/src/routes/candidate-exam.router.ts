import express from 'express';
import { CandidateExamController } from '../controllers/candidate-exam.controllers';
import { validateRequest } from '../middlewares/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateCandidate } from '../middlewares/auth.middleware';
import { prisma } from '../db/prisma.client';
import { CandidateExamService } from '../services/candiate-exam.services';
import { candidateExamSchema } from '../validationSchemas/candidate-exam.validations';
import { upload } from '../utils/fileUpload';
import { UploadService } from '../services/upload.services';

const router = express.Router();
const candidateExamService = new CandidateExamService();
const uploadService = new UploadService();
const candidateExamController = new CandidateExamController(candidateExamService, uploadService);

router.get(
  '/:examId/start',
  authenticateCandidate,
  validateRequest(candidateExamSchema.startExam),
  asyncHandler(candidateExamController.startExam)
);

router.get(
  '/:examId/next-question',
  authenticateCandidate,
  asyncHandler(candidateExamController.getNextQuestion)
);

router.post(
  '/:examId/submit-answer',
  authenticateCandidate,
  asyncHandler(candidateExamController.submitAnswer)
);
router.post(
  '/:examId/reset-answer',
  authenticateCandidate,
  validateRequest(candidateExamSchema.resetAnswer),

  asyncHandler(candidateExamController.resetAnswer)
);

router.get(
  '/:examId/finish',
  authenticateCandidate,
  asyncHandler(candidateExamController.finishExam)
);

router.post(
  '/:examId/submit-violation',
  authenticateCandidate,
  asyncHandler(candidateExamController.submitViolation)
);

router.get(
  '/:examId/status',
  authenticateCandidate,
  asyncHandler(candidateExamController.getExamStatus)
);

router.get(
  '/:examId',
  authenticateCandidate,
  validateRequest(candidateExamSchema.get),
  asyncHandler(candidateExamController.getExam)
);
router.post(
  '/:examId/snapshot',
  authenticateCandidate,
  upload.single('file'),
  asyncHandler(candidateExamController.saveSnapshot)
);

router.get(
  '/',
  authenticateCandidate,
  asyncHandler(candidateExamController.getCandidate)
);

export default router;
