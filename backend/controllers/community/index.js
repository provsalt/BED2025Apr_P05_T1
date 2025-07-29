import express from "express";
import { createEvent, updateEvent, getApprovedEvents, getMyEvents, getEventById } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from '../../middleware/validateSchema.js';
import { CommunityInformation } from '../../utils/validation/community.js';
import { genericUploadMiddleware } from '../../middleware/upload.js';

const router = express.Router();

// POST /api/community/create - Create a new community event
router.post(
  "/create",
  getUserMiddleware,
  genericUploadMiddleware.array('images'), 
  validateSchema(CommunityInformation),
  createEvent
);

// PUT /api/community/:id - Update a community event
router.put(
  "/:id",
  getUserMiddleware,
  genericUploadMiddleware.array('images'),
  validateSchema(CommunityInformation),
  updateEvent
);

// GET /api/community - Get all approved community events
router.get("/", getUserMiddleware, getApprovedEvents);

// GET /api/community/myevents - Get all community events created by the authenticated user
router.get("/myevents", getUserMiddleware, getMyEvents);

// GET /api/community/:id - Get details for a single community event
router.get("/:id", getUserMiddleware, getEventById);

export default router; 