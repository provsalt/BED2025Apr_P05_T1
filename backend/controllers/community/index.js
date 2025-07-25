import express from "express";
import { createEvent } from "./communityEventController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from '../../middleware/validateSchema.js';
import { CommunityInformation } from '../../utils/validation/community.js';
import { genericUploadMiddleware } from '../../middleware/upload.js';
import { getAllEvents } from './communityEventController.js';

const router = express.Router();

router.post("/create", getUserMiddleware, genericUploadMiddleware.single("image"), validateSchema(CommunityInformation), createEvent);
router.get('/events', getAllEvents);

export default router; 