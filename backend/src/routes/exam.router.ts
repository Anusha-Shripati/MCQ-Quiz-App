import express from 'express';
import { ExamController } from '../controllers/exam.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { examSchema } from '../validationSchemas/exam.validations';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const examRouter = express.Router();
const examController = new ExamController();

examRouter.post(
    '/create',
    authenticateAndAuthorize('exams.can_edit'),
    validateRequest(examSchema.create),
    asyncHandler(examController.create)
);

examRouter.put(
    '/:id',
    authenticateAndAuthorize('exams.can_edit'),
    validateRequest(examSchema.update),
    asyncHandler(examController.update)
);

examRouter.delete(
    '/:id',
    authenticateAndAuthorize('exams.can_edit'),
    validateRequest(examSchema.delete),
    asyncHandler(examController.delete)
);

examRouter.get(
    '/list',
    authenticateAndAuthorize('exams.can_read'),
    asyncHandler(examController.get)
);

examRouter.get(
    '/:id',
    validateRequest(examSchema.get),
    authenticateAndAuthorize('exams.can_read'),
    asyncHandler(examController.getById)
);

export default examRouter; 