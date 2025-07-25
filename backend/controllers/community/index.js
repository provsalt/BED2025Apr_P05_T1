import express from "express";
import { createEvent } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from '../../middleware/validateSchema.js';
import { CommunityInformation } from '../../utils/validation/community.js';
import { genericUploadMiddleware } from '../../middleware/upload.js';
import { getApprovedEvents, getMyEvents } from "./communityEventController.js";

const router = express.Router();

router.post("/create", getUserMiddleware, genericUploadMiddleware.single("image"), validateSchema(CommunityInformation), createEvent);
router.get("/", getUserMiddleware, getApprovedEvents);

// GET /api/community/myevents - Get all community events created by the authenticated user
router.get("/myevents", getUserMiddleware, getMyEvents);

export default router; 