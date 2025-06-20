import express from 'express';
import { AssessmentController } from '../controllers/assessments.controllers';
import { validateRequest } from '../middlewares/validation.middleware';
import { assessmentSchema } from '../validationSchemas/assessments.validations';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';

const assessmentRouter = express.Router();
const assessmentController = new AssessmentController();

assessmentRouter.post(
  '/create',
  authenticateAndAuthorize('assessments.can_edit'),
  validateRequest(assessmentSchema.create),
  asyncHandler(assessmentController.create)
);
assessmentRouter.post("/check-unique", validateRequest(assessmentSchema.checkUnique), asyncHandler(assessmentController.checkUnique));

assessmentRouter.put(
  '/:id',
  validateRequest(assessmentSchema.update),
  authenticateAndAuthorize('assessments.can_edit'),
  asyncHandler(assessmentController.update)
);
assessmentRouter.get(
  '/list',
  authenticateAndAuthorize('assessments.can_read'),
  asyncHandler(assessmentController.get)
);
assessmentRouter.get(
  '/all',
  authenticateAndAuthorize('assessments.can_read'),
  asyncHandler(assessmentController.getAllAssessment)
);
assessmentRouter.get(
  '/:id',
  validateRequest(assessmentSchema.get),
  authenticateAndAuthorize('assessments.can_read'),
  asyncHandler(assessmentController.getAssessmentById)
);

assessmentRouter.delete(
  '/:id',
  authenticateAndAuthorize('assessments.can_edit'),
  validateRequest(assessmentSchema.delete),
  asyncHandler(assessmentController.delete)
);


export default assessmentRouter;
