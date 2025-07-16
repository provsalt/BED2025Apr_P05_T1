import express from "express";
import multer from "multer";
import { createEvent } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateImageType } from "../../middleware/validateImage.js";
import { validateCommunity } from '../../middleware/validateCommunity.js';
import { CommunityInformation } from '../../utils/validation/community.js';

const router = express.Router();
const upload = multer(); // memory storage

router.post("/create", getUserMiddleware, upload.single("image"), validateImageType, validateCommunity(CommunityInformation), createEvent);

export default router; 