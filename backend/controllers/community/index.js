import express from "express";
import { createEvent, updateEvent, getApprovedEvents, getMyEvents, getEventById, signUpForEvent, userSignedUpEvents, cancelEventSignup, deleteEvent, getPendingCommunityEventsController, approveCommunityEventController, rejectCommunityEventController } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from '../../middleware/validateSchema.js';
import { CommunityInformation } from '../../utils/validation/community.js';
import { genericUploadMiddleware } from '../../middleware/upload.js';
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

// GET /api/community/pending - Get all pending community events for admin approval
router.get("/pending", getUserMiddleware, authorizeRole(["Admin"]), getPendingCommunityEventsController);

// POST /api/community/approve - Approve a community event
router.post("/approve", getUserMiddleware, authorizeRole(["Admin"]), approveCommunityEventController);

// POST /api/community/reject - Reject a community event
router.post("/reject", getUserMiddleware, authorizeRole(["Admin"]), rejectCommunityEventController);

// GET /api/community/signups - Get user's signed up events
router.get("/signups", getUserMiddleware, userSignedUpEvents);

// GET /api/community/:id - Get details for a single community event
router.get("/:id", getUserMiddleware, getEventById);

// POST /api/community/:eventId/signup - Sign up for a community event
router.post("/:eventId/signup", getUserMiddleware, signUpForEvent);

// DELETE /api/community/:eventId/signup - Cancel signup for a community event
router.delete("/:eventId/signup", getUserMiddleware, cancelEventSignup);

// DELETE /api/community/:id - Delete a community event
router.delete("/:id", getUserMiddleware, deleteEvent);

export default router;
