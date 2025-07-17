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

const transportRouter = Router();

transportRouter.get("/stations", getStationCodeNameMap);

transportRouter.get("/shortest", getUserMiddleware, getShortestPath);

transportRouter.post("/routes", getUserMiddleware, createRouteController);
transportRouter.get("/routes/:id", getUserMiddleware, getRouteController);
transportRouter.get("/routes", getUserMiddleware, getUserRoutesController);
transportRouter.put("/routes/:id", getUserMiddleware, updateRouteController);
transportRouter.delete("/routes/:id", getUserMiddleware, deleteRouteController);

export default transportRouter;
