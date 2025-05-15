import express from 'express';
import { UserController } from '../controllers/user.controllers';
import { validateRequest } from '../middlewares/validation.middleware';
import { userSchema } from '../validationSchemas/user.validations';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateAndAuthorize } from '../middlewares/auth.middleware';
import { upload } from '../utils/fileUpload';

const userRouter = express.Router();
const userController = new UserController();

userRouter.post(
  '/create',
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.create),
  asyncHandler(userController.create)
);

userRouter.post('/login', validateRequest(userSchema.login), asyncHandler(userController.login));

userRouter.get(
  '/list',
  authenticateAndAuthorize('users.can_read'),
  asyncHandler(userController.list)
);

userRouter.get('/:id', validateRequest(userSchema.get), asyncHandler(userController.getUserById));

userRouter.put(
  '/:id',
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.update),
  asyncHandler(userController.update)
);

userRouter.put(
  '/change-password/:id',
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.changePassword),
  asyncHandler(userController.changePassword)
);

userRouter.put(
  '/upload-image/:id',
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.uploadImage),
  upload.single('file'),
  asyncHandler(userController.uploadImage)
);

userRouter.delete(
  '/:id',
  // authenticateAndAuthorize(["Super_Admin", "Editor"]),
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.delete),
  asyncHandler(userController.delete)
);

export default userRouter;
