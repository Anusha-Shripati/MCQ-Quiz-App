import express from 'express';
import { resultSchema } from '../validations/result.validations';
import { validateRequest } from '../../middlewares/validation.middleware';
import { ResultController } from '../controllers/result.controllers';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticateAndAuthorize } from '../../middlewares/auth.middleware';

const resultRouter = express.Router();
const resultController = new ResultController()

resultRouter.get("/list",
    authenticateAndAuthorize('results.can_read'),
    asyncHandler(resultController.list));

resultRouter.get("/:id",
    authenticateAndAuthorize('results.can_read'),
    validateRequest(resultSchema.get),
    asyncHandler(resultController.get));

resultRouter.post("/update-score",
    authenticateAndAuthorize('results.can_edit'),
    validateRequest(resultSchema.updateScore),
    asyncHandler(resultController.updateScore));

resultRouter.get("/feedback/:resultId",
    asyncHandler(resultController.getFeedback));

export default resultRouter;
