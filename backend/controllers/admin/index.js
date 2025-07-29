import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";
import { getDeletionRequestsController, approveUserDeletionController } from "./adminController.js";
import { 
  getDashboardAnalyticsController, 
  getElderlyEngagementController 
} from "./analyticsController.js";
import {
  getLoginAnalyticsSummaryController,
  getUserLoginAnalyticsController,
  getLoginAttemptsByDayController,
  getTopUsersByLoginAttemptsController,
  getSuspiciousLoginAttemptsController,
  getDetailedLoginAttemptsController
} from "./loginAnalyticsController.js";

const router = Router();

router.use(getUserMiddleware);
router.use(authorizeRole(["Admin"]))

router.get("/deletion-requests", getDeletionRequestsController);
router.post("/approve-delete", approveUserDeletionController);

// Admin analytics endpoints
router.get("/analytics/dashboard", getDashboardAnalyticsController);
router.get("/analytics/elderly-engagement", getElderlyEngagementController);

// Login Analytics Routes
router.get("/analytics/login/summary", getLoginAnalyticsSummaryController);
router.get("/analytics/login/user/:userId", getUserLoginAnalyticsController);
router.get("/analytics/login/by-day", getLoginAttemptsByDayController);
router.get("/analytics/login/top-users", getTopUsersByLoginAttemptsController);
router.get("/analytics/login/suspicious", getSuspiciousLoginAttemptsController);
router.get("/analytics/login/detailed", getDetailedLoginAttemptsController);

export default router; 