import express from 'express';
import { CandidateExamController } from '../controllers/candidate-exam.controllers';
import { validateRequest } from '../../middlewares/validation.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticateCandidate } from '../../middlewares/auth.middleware';
import { candidateExamSchema } from '../validations/candidate-exam.validations';
import { upload } from '../../utils/fileUpload';

const router = express.Router();
const candidateExamController = new CandidateExamController();

router.post("/:examId/submit-verified-image",
  upload.single('file'),
  asyncHandler(candidateExamController.submitVerifiedImage)
);
router.post(
  '/:examId/submit-feedback',
  authenticateCandidate,
  validateRequest(candidateExamSchema.submitFeedback),
  asyncHandler(candidateExamController.submitFeedback)
);
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

router.post(
  '/:examId/integrity-evidence',
  authenticateCandidate,
  upload.single('file'),
  asyncHandler(candidateExamController.saveIntegrityEvidence)
);

router.get(
  '/',
  authenticateCandidate,
  asyncHandler(candidateExamController.getCandidate)
);

router.post(
  '/:examId/send-thank-you-email',
  authenticateCandidate,
  asyncHandler(candidateExamController.sendThankYouEmail)
);

export default router;
