import express from 'express';
import { ModuleController } from '../controllers/module.controllers';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';

const roleRouter = express.Router();
const roleController = new ModuleController();

roleRouter.get(
  '/list',
  authenticateAndAuthorize(undefined, 'Super Admin'),

  asyncHandler(roleController.get)
);

export default roleRouter;
