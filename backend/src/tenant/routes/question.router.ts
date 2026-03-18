import express from 'express';
import { QuestionsController } from '../controllers/question.controllers';
import { validateRequest, validateUploadFile } from '../../middlewares/validation.middleware';
import { questionsSchema } from '../validations/questions.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticateAndAuthorize } from '../../middlewares/auth.middleware';
import { enforceUsageLimit } from '../../platform/middlewares/usage-enforcement.middleware';
import { UsageMetric } from '../../db/prisma/generated/client';

const questionRouter = express.Router();
const questionsController = new QuestionsController();
questionRouter.post(
  '/import',
  authenticateAndAuthorize('questions.can_edit'),
  enforceUsageLimit(UsageMetric.questions),
  validateUploadFile(),
  asyncHandler(questionsController.importQuestionsFromXlsx)
);

questionRouter.get('/download-template', authenticateAndAuthorize('questions.can_read'), asyncHandler(questionsController.downloadQuestionFile));
questionRouter.get('/technology', authenticateAndAuthorize('questions.can_read'), asyncHandler(questionsController.getTechnology));

questionRouter.post(
  '/create-multiple',
  authenticateAndAuthorize('questions.can_edit'),
  enforceUsageLimit(UsageMetric.questions),
  validateRequest(questionsSchema.createMultiple),
  asyncHandler(questionsController.createMultiple)
);

questionRouter.post(
  '/create',
  authenticateAndAuthorize('questions.can_edit'),
  enforceUsageLimit(UsageMetric.questions),
  validateRequest(questionsSchema.create),
  asyncHandler(questionsController.create)
);

questionRouter.put(
  '/:id',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(questionsSchema.update),
  asyncHandler(questionsController.update)
);
questionRouter.get(
  '/list',
  authenticateAndAuthorize('questions.can_read'),
  asyncHandler(questionsController.get)
);
questionRouter.get(
  '/:id',
  authenticateAndAuthorize('questions.can_read'),
  validateRequest(questionsSchema.get),
  asyncHandler(questionsController.getQuestionById)
);

questionRouter.delete(
  '/:id',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(questionsSchema.delete),
  asyncHandler(questionsController.delete)
);

export default questionRouter;
