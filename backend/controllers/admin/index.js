import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";
import { getDeletionRequestsController, approveUserDeletionController } from "./adminController.js";
import { 
  getDashboardAnalyticsController, 
  getElderlyEngagementController 
} from "./analyticsController.js";

const router = Router();

router.use(getUserMiddleware);
router.use(authorizeRole(["Admin"]))

router.get("/deletion-requests", getDeletionRequestsController);
router.post("/approve-delete", approveUserDeletionController);

// Admin analytics endpoints
router.get("/analytics/dashboard", getDashboardAnalyticsController);
router.get("/analytics/elderly-engagement", getElderlyEngagementController);

export default router; 