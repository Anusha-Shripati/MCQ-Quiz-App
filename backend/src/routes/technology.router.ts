import express from "express";
import { TechnologyController } from "../controllers/technology.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { teachnologySchema } from "../validationSchemas/technology.validations";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateAndAuthorize } from "../middlewares/auth.middleware";

const technologyRouter = express.Router();
const technologyController = new TechnologyController();

technologyRouter.post(
  "/create",
  validateRequest(teachnologySchema.create),
  authenticateAndAuthorize("assessments.can_edit"),
  asyncHandler(technologyController.create)
);

technologyRouter.get(
  "/list",
  authenticateAndAuthorize("assessments.can_read"),
  asyncHandler(technologyController.list)
);

// technologyRouter.get(
//   "/questions",
//   authenticateAndAuthorize("assessments.can_read"),
//   asyncHandler(technologyController.getTechnologyWithQuestion)
// );

technologyRouter.get(
  "/:id",
  validateRequest(teachnologySchema.get),
  authenticateAndAuthorize("assessments.can_read"),
  asyncHandler(technologyController.getTechnologyById)
);

technologyRouter.put(
  "/:id",
  authenticateAndAuthorize("assessments.can_edit"),
  validateRequest(teachnologySchema.update),
  asyncHandler(technologyController.update)
);

technologyRouter.delete(
  "/:id",
  authenticateAndAuthorize("assessments.can_edit"),
  validateRequest(teachnologySchema.delete),
  asyncHandler(technologyController.delete)
);

export default technologyRouter;
