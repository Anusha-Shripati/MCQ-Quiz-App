import express from 'express';
import { CandidateController } from '../controllers/candidates.controllers';
import { validateRequest } from '../middlewares/validation.middleware';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';
import { candidateSchema } from '../validationSchemas/candidates.validations';
import { asyncHandler } from '../utils/asyncHandler';

const candidateRouter = express.Router();
const candidateController = new CandidateController();

candidateRouter.post(
	'/create',
	authenticateAndAuthorize('candidates.can_edit'),
	validateRequest(candidateSchema.create),
	asyncHandler(candidateController.create)
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
	validateRequest(candidateSchema.get),
	authenticateAndAuthorize('candidates.can_read'),
	asyncHandler(candidateController.getCandidateById)
);

export default candidateRouter;
