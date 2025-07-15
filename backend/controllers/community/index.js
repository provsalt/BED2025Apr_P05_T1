import express from "express";
import multer from "multer";
import { createEvent } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateImageType } from "../../middleware/validateImage.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/create", getUserMiddleware, upload.single("image"), validateImageType, createEvent);

export default router; 