import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";
import { getDeletionRequestsController, approveUserDeletionController, getPendingCommunityEventsController, approveCommunityEventController, rejectCommunityEventController } from "./adminController.js";

const router = Router();

router.use(getUserMiddleware);
router.use(authorizeRole(["Admin"]))

router.get("/deletion-requests", getDeletionRequestsController);
router.post("/approve-delete", approveUserDeletionController);

// Community event approval routes
router.get("/community/pending", getPendingCommunityEventsController);
router.post("/community/approve", approveCommunityEventController);
router.post("/community/reject", rejectCommunityEventController);

export default router;