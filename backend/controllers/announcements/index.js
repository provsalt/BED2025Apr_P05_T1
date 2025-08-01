import {
  createAnnouncementController, deleteAnnouncementController, getAnnouncementByIdController,
  getAnnouncementsController, dismissAnnouncementController
} from "./announcementcontroller.js";
import {Router} from "express";
import {getUserMiddleware} from "../../middleware/getUser.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";

const router = Router();

router.post("/", getUserMiddleware, authorizeRole(["Admin"]), createAnnouncementController);
router.get("/", getAnnouncementsController); // Public route
router.get("/user", getUserMiddleware); // User-specific announcements
router.post("/:id/dismiss", getUserMiddleware, dismissAnnouncementController); // Dismiss announcement
router.get("/:id", getAnnouncementByIdController); // Public route
router.delete("/:id", getUserMiddleware, authorizeRole(["Admin"]), deleteAnnouncementController);

export default router;