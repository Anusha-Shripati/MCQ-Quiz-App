import express from 'express';
import { QuestionsController } from '../controllers/question.controllers';
import { validateRequest } from '../middlewares/validation.middleware';
import { questionsSchema } from '../validationSchemas/questions.validations';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';

const questionRouter = express.Router();
const questionsController = new QuestionsController();
questionRouter.get("/download", authenticateAndAuthorize('questions.can_read'), asyncHandler(questionsController.downloadQuestionFile));

questionRouter.post(
  '/create',
  authenticateAndAuthorize('questions.can_edit'),
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
