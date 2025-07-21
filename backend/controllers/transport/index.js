import { Router } from "express";
import { getShortestPath, getStationCodeNameMap } from "./transportController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import {
    createRouteController,
    getRouteController,
    getUserRoutesController,
    updateRouteController,
    deleteRouteController
} from "./routeController.js";
import {validateSchema, validateQuery, validateParams} from "../../middleware/validateSchema.js";
import {routeSchema, shortestPathQuerySchema, routeParamsSchema} from "../../utils/validation/transport.js";

const transportRouter = Router();

transportRouter.get("/stations", getStationCodeNameMap);

transportRouter.get("/shortest", getUserMiddleware, validateQuery(shortestPathQuerySchema), getShortestPath);

transportRouter.post("/routes", getUserMiddleware, validateSchema(routeSchema), createRouteController);
transportRouter.get("/routes/:id", getUserMiddleware, validateParams(routeParamsSchema), getRouteController);
transportRouter.get("/routes", getUserMiddleware, getUserRoutesController);
transportRouter.put("/routes/:id", getUserMiddleware, validateParams(routeParamsSchema), validateSchema(routeSchema), updateRouteController);
transportRouter.delete("/routes/:id", getUserMiddleware, validateParams(routeParamsSchema), deleteRouteController);

export default transportRouter;
