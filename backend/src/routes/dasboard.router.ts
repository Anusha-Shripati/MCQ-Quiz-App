import express from "express";
import { DashboardController } from "../controllers/dashboard.controllers";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticateAndAuthorize } from "../middlewares/auth.middleware";

const dashboardRouter = express.Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
  "/get-questions-data",
  authenticateAndAuthorize(undefined,'Super Admin'),
  asyncHandler(dashboardController.questionData)
);
dashboardRouter.get(
  "/get-interview-data",
  authenticateAndAuthorize(undefined,'Super Admin'),
  asyncHandler(dashboardController.interviewData)
);
dashboardRouter.get(
  "/get-interview-count",
  authenticateAndAuthorize(undefined,'Super Admin'),
  asyncHandler(dashboardController.interviewCount)
);
dashboardRouter.get(
  "/get-interview-score",
  authenticateAndAuthorize(undefined,'Super Admin'),
  asyncHandler(dashboardController.interviewScroreData)
);

export default dashboardRouter;
