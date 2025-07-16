import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";
import {
  getDashboardMetricsController,
  getAgeGroupMetricsController,
  getPopularPagesController,
  getLoginAttemptStatsController,
  getFailedLoginAttemptsController,
  getUserEngagementController
} from "./userMetricsController.js";

const router = Router();

// Apply admin authentication to all routes
router.use(getUserMiddleware);
router.use(authorizeRole(["Admin"]));

// User metrics endpoints
router.get("/metrics/dashboard", getDashboardMetricsController);
router.get("/metrics/age-groups", getAgeGroupMetricsController);
router.get("/metrics/popular-pages", getPopularPagesController);
router.get("/metrics/login-attempts", getLoginAttemptStatsController);
router.get("/metrics/failed-logins", getFailedLoginAttemptsController);
router.get("/metrics/user-engagement", getUserEngagementController);

export default router; 