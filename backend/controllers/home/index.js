import { Router } from "express";
import { getDashboardSummary } from "./dashboardSummaryController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";

const router = Router();

router.get("/user/summary", getUserMiddleware, getDashboardSummary);

export default router; 