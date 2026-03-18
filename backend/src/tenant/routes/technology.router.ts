import express from 'express';
import { TechnologyController } from '../controllers/technology.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { teachnologySchema } from '../validations/technology.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticateAndAuthorize } from '../../middlewares/auth.middleware';

const technologyRouter = express.Router();
const technologyController = new TechnologyController();

technologyRouter.post(
  '/create',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(teachnologySchema.create),
  asyncHandler(technologyController.create)
);

technologyRouter.post(
  '/create-only',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(teachnologySchema.createOnly),
  asyncHandler(technologyController.createTechnologyOnly)
);

technologyRouter.get(
  '/list',
  authenticateAndAuthorize('questions.can_read'),
  asyncHandler(technologyController.list)
);

// technologyRouter.get(
//   "/questions",
//   authenticateAndAuthorize("questions.can_read"),
//   asyncHandler(technologyController.getTechnologyWithQuestion)
// );

technologyRouter.get(
  '/:id',
  authenticateAndAuthorize('questions.can_read'),
  validateRequest(teachnologySchema.get),
  asyncHandler(technologyController.getTechnologyById)
);

technologyRouter.put(
  '/:id',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(teachnologySchema.update),
  asyncHandler(technologyController.update)
);

technologyRouter.put(
  '/:id/name',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(teachnologySchema.updateName),
  asyncHandler(technologyController.updateTechnologyName)
);

technologyRouter.delete(
  '/:id',
  authenticateAndAuthorize('questions.can_edit'),
  validateRequest(teachnologySchema.delete),
  asyncHandler(technologyController.delete)
);

export default technologyRouter;
