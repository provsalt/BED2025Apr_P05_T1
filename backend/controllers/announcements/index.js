import {
  createAnnouncementController, deleteAnnouncementController, getAnnouncementByIdController,
  getAnnouncementsController
} from "./announcementcontroller.js";
import {Router} from "express";
import {getUserMiddleware} from "../../middleware/getUser.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";

const router = Router();

router.post("/", getUserMiddleware, authorizeRole(["Admin"]), createAnnouncementController);
router.get("/", getAnnouncementsController); // Public route
router.get("/:id", getAnnouncementByIdController); // Public route
router.delete("/:id", getUserMiddleware, authorizeRole(["Admin"]), deleteAnnouncementController);

export default router;