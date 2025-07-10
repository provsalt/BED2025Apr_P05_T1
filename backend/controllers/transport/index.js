import { Router } from "express";
import {getShortestPath, getStationCodes, getStationNames} from "./transportController.js";
import {getUserController} from "../user/userController.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";

const transportRouter = Router();

transportRouter.get("/", getUserController, authorizeRole(["User"]), getStationCodes);
transportRouter.get("/stations", getUserController, authorizeRole(["User"]), getStationNames);
transportRouter.get("/shortest", getUserController, authorizeRole(["User"]), getShortestPath);

export default transportRouter;