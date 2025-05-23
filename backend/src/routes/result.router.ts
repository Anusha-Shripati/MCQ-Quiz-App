import express from 'express';
import { resultSchema } from '../validationSchemas/result.validations';
import { validateRequest } from '../middlewares/validation.middleware';
import { ResultController } from '../controllers/result.controllers';
import { asyncHandler } from '../utils/asyncHandler';

const resultRouter = express.Router();
const resultController = new ResultController()
resultRouter.get("/:id", validateRequest(resultSchema.get), asyncHandler(resultController.get));

export default resultRouter;
