import express from "express";
import { RoleController } from "../controllers/role.controllers";
import { validateRequest } from "../middlewares/validation.middleware";
import { roleSchema } from "../validationSchemas/role.validations";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateAndAuthorize } from "../middlewares/auth.middleware";

const roleRouter = express.Router();
const roleController = new RoleController();

roleRouter.post(
  "/create",
  authenticateAndAuthorize(undefined,'Super Admin'),
  validateRequest(roleSchema.create),
  asyncHandler(roleController.create)
);

roleRouter.put(
  "/:id",
  validateRequest(roleSchema.update),
  authenticateAndAuthorize(undefined,'Super Admin'),
  asyncHandler(roleController.update)
);

roleRouter.get(
  "/list",
  asyncHandler(roleController.get)
);

roleRouter.delete(
  "/:id",
  authenticateAndAuthorize(undefined,'Super Admin'),
  asyncHandler(roleController.delete)
);

export default roleRouter;
