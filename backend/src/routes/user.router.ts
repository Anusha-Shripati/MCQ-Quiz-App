import express from "express";
import { UserController } from "../controllers/user.controllers";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  userSchema
} from "../validationSchemas/user.validations";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateAndAuthorize } from "../middlewares/auth.middleware";

const userRouter = express.Router();
const userController = new UserController();

userRouter.post(
  "/create",
  authenticateAndAuthorize('users.can_edit'),
  // authenticateAndAuthorize(["Super_Admin", "Editor"]), // Middleware for auth and role check
  validateRequest(userSchema.create),
  asyncHandler(userController.create) 
);

userRouter.post(
  "/login",
  validateRequest(userSchema.login),
  asyncHandler(userController.login)
);

userRouter.get(
  "/list",
  authenticateAndAuthorize('users.can_read'),
  asyncHandler(userController.list)
);

userRouter.get(
  "/:id",
  validateRequest(userSchema.get),
  asyncHandler(userController.getUserById)
);
userRouter.post(
  "/:id",
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.update),
  asyncHandler(userController.update)
);

userRouter.delete(
  "/:id",
  // authenticateAndAuthorize(["Super_Admin", "Editor"]),
  authenticateAndAuthorize('users.can_edit'),
  validateRequest(userSchema.delete),
  asyncHandler(userController.delete)
);

export default userRouter;
