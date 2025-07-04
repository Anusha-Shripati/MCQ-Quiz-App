import express from 'express';
import { QuestionsController } from '../controllers/question.controllers';
import { validateRequest, validateUploadFile } from '../middlewares/validation.middleware';
import { questionsSchema } from '../validationSchemas/questions.validations';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';

const questionRouter = express.Router();
const questionsController = new QuestionsController();
questionRouter.post(
  '/import',
  authenticateAndAuthorize(),
  validateUploadFile(),
  asyncHandler(questionsController.importQuestionsFromXlsx)
);

questionRouter.get('/download-template', asyncHandler(questionsController.downloadQuestionFile));
questionRouter.get('/technology', asyncHandler(questionsController.getTechnology));

questionRouter.post(
  '/create',
  authenticateAndAuthorize(),
  validateRequest(questionsSchema.create),
  asyncHandler(questionsController.create)
);

questionRouter.put(
  '/:id',
  authenticateAndAuthorize(),
  validateRequest(questionsSchema.update),
  asyncHandler(questionsController.update)
);
questionRouter.get(
  '/list',
  authenticateAndAuthorize(),
  asyncHandler(questionsController.get)
);
questionRouter.get(
  '/:id',
  authenticateAndAuthorize(),
  validateRequest(questionsSchema.get),
  asyncHandler(questionsController.getQuestionById)
);

questionRouter.delete(
  '/:id',
  authenticateAndAuthorize(),
  validateRequest(questionsSchema.delete),
  asyncHandler(questionsController.delete)
);

export default questionRouter;
