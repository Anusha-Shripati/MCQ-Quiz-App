import express from 'express';
import { ExamController } from '../controllers/exam.controller';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { examSchema } from '../validationSchemas/exam.validations';

const examRouter = express.Router();
const examController = new ExamController();

examRouter.get(
  '/:id',
  validateRequest(examSchema.get),
  authenticateAndAuthorize('exams.can_read'),
  asyncHandler(examController.getById)
);

export default examRouter;
