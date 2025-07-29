import { Router } from "express";
import {getUserMiddleware} from "../../middleware/getUser.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";
import {getConnectedUsersController, getConnectedUsersInstant} from "./connectedUserController.js";
import {
  getPageVisitFrequencyController,
  getLoginAttemptsAnalyticsController,
  getFailedLoginAttemptsController,
  getUserEngagementController,
  getNewUserSignupsController
} from "./analyticsController.js";

const analyticsRouter = Router();

analyticsRouter.use(getUserMiddleware);
analyticsRouter.use(authorizeRole(["Admin"]))

analyticsRouter.get("/connected-users", getConnectedUsersController)
analyticsRouter.get("/connected-users/instant", getConnectedUsersInstant)

analyticsRouter.get("/page-visits", getPageVisitFrequencyController)
analyticsRouter.get("/login-attempts", getLoginAttemptsAnalyticsController)
analyticsRouter.get("/failed-logins", getFailedLoginAttemptsController)
analyticsRouter.get("/user-engagement/:userId", getUserEngagementController)
analyticsRouter.get("/new-user-signups", getNewUserSignupsController)

export default analyticsRouter;
