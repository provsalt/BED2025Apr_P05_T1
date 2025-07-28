import { Router } from "express";
import {getUserMiddleware} from "../../middleware/getUser.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";
import {getConnectedUsersController, getConnectedUsersInstant} from "./connectedUserController.js";

const analyticsRouter = Router();

analyticsRouter.use(getUserMiddleware);
analyticsRouter.use(authorizeRole(["Admin"]))

analyticsRouter.get("/connected-users", getConnectedUsersController)
analyticsRouter.get("/connected-users/instant", getConnectedUsersInstant)

export default analyticsRouter;
