import express from 'express';
import { CandidateController } from '../controllers/candidates.controllers';
import { authenticateAndAuthorize } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validation.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { candidateSchema } from '../validations/candidates.validations';

const candidateRouter = express.Router();
const candidateController = new CandidateController();

candidateRouter.post(
  '/create',
  authenticateAndAuthorize('candidates.can_edit'),
  validateRequest(candidateSchema.create),
  asyncHandler(candidateController.create)
);
candidateRouter.get(
  '/reset-all/:id',
  asyncHandler(candidateController.resetAll)
);

candidateRouter.put(
  '/:id',
  authenticateAndAuthorize('candidates.can_edit'),
  validateRequest(candidateSchema.update),
  asyncHandler(candidateController.update)
);

candidateRouter.delete(
  '/:id',
  authenticateAndAuthorize('candidates.can_edit'),
  validateRequest(candidateSchema.delete),
  asyncHandler(candidateController.delete)
);

candidateRouter.get(
  '/list',
  authenticateAndAuthorize('candidates.can_read'),
  asyncHandler(candidateController.get)
);

candidateRouter.get(
  '/:id',
  authenticateAndAuthorize('candidates.can_read'),
  validateRequest(candidateSchema.get),
  asyncHandler(candidateController.getCandidateById)
);

export default candidateRouter;
