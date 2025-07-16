import { Router } from "express";
import {getShortestPath, getStationCodeNameMap} from "./transportController.js";
import {getUserMiddleware} from "../../middleware/getUser.js";

const transportRouter = Router();

transportRouter.get("/stations", getStationCodeNameMap);
transportRouter.get("/shortest", getUserMiddleware, getShortestPath);

export default transportRouter;