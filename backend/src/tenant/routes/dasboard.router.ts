import express from 'express';
import { DashboardController } from '../controllers/dashboard.controllers';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticateAndAuthorize } from '../../middlewares/auth.middleware';

const dashboardRouter = express.Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
  '/get-questions-data',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.questionData)
);
dashboardRouter.get(
  '/get-interview-data',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.interviewData)
);
dashboardRouter.get(
  '/get-interview-count',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.interviewCount)
);
dashboardRouter.get(
  '/get-interview-score',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.interviewScroreData)
);
dashboardRouter.get(
  '/get-calendar-data',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.calendarData)
);
dashboardRouter.get(
  '/get-top-assessments',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.topAssignedAssessments)
);
dashboardRouter.get(
  '/get-question-type-performance',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.questionTypePerformance)
);
dashboardRouter.get(
  '/get-exam-duration-performance',
  authenticateAndAuthorize(),
  asyncHandler(dashboardController.examDurationVsPerformance)
);


export default dashboardRouter;
