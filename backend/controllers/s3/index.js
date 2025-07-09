
import { Router } from "express";
import { getFileByKey } from "./fileController.js";

const router = Router();

router.get("/", getFileByKey);

export default router;
