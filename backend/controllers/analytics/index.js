import { Router } from "express";
import {getUserMiddleware} from "../../middleware/getUser.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";
import {getConnectedUsersController, getConnectedUsersInstant} from "./connectedUserController.js";
import {getCpuUsageController, getCpuUsageInstant, getMemoryUsageController, getMemoryUsageInstant} from "./systemMetricsController.js";

const analyticsRouter = Router();

analyticsRouter.use(getUserMiddleware);
analyticsRouter.use(authorizeRole(["Admin"]))

analyticsRouter.get("/connected-users", getConnectedUsersController)
analyticsRouter.get("/connected-users/instant", getConnectedUsersInstant)
analyticsRouter.get("/cpu-usage", getCpuUsageController)
analyticsRouter.get("/cpu-usage/instant", getCpuUsageInstant)
analyticsRouter.get("/memory-usage", getMemoryUsageController)
analyticsRouter.get("/memory-usage/instant", getMemoryUsageInstant)

export default analyticsRouter;
