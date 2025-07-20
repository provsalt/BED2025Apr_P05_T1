import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";
import { getDeletionRequestsController, approveUserDeletionController } from "./adminController.js";

const router = Router();

router.get("/deletion-requests", getUserMiddleware, authorizeRole(["Admin"]), getDeletionRequestsController);
router.post("/:id/approve-delete", getUserMiddleware, authorizeRole(["Admin"]), approveUserDeletionController);

export default router; 