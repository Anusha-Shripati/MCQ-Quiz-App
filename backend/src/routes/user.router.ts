import express from "express";
import { UserController } from "../controllers/user.controllers";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  createUserSchema,
  loginSchema,
} from "../validationSchemas/user.validations";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateAndAuthorize } from "../middlewares/auth.middleware";

const userRouter = express.Router();
const userController = new UserController();

userRouter.post(
  "/create",
  authenticateAndAuthorize(["Super_Admin", "Editor"]), // Middleware for auth and role check
  validateRequest(createUserSchema),
  asyncHandler(userController.create) // Async handler for the controller
);

userRouter.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(userController.login)
);

userRouter.get(
  "/list",
  authenticateAndAuthorize(["Super_Admin", "Editor", "Candidate"]),
  asyncHandler(userController.list)
);

export default userRouter;
