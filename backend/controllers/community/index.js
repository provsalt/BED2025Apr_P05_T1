import express from "express";
import { createEvent } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from '../../middleware/validateSchema.js';
import { CommunityInformation } from '../../utils/validation/community.js';
import { genericUploadMiddleware } from '../../middleware/upload.js';
import { getApprovedEvents, getMyEvents, getEventById, getPendingCommunityEventsController, approveCommunityEventController, rejectCommunityEventController } from "./communityEventController.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";

const router = express.Router();

// POST /api/community/create - Create a new community event
router.post(
  "/create",
  getUserMiddleware,
  genericUploadMiddleware.array('images'), 
  validateSchema(CommunityInformation),
  createEvent
);

// GET /api/community - Get all approved community events
router.get("/", getUserMiddleware, getApprovedEvents);

// GET /api/community/myevents - Get all community events created by the authenticated user
router.get("/myevents", getUserMiddleware, getMyEvents);

// Community event approval routes
router.get("/pending", getUserMiddleware, authorizeRole(["Admin"]), getPendingCommunityEventsController);
router.post("/approve", getUserMiddleware, authorizeRole(["Admin"]), approveCommunityEventController);
router.post("/reject", getUserMiddleware, authorizeRole(["Admin"]), rejectCommunityEventController);

// GET /api/community/:id - Get details for a single community event
router.get("/:id", getUserMiddleware, getEventById);

export default router; 