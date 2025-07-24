import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { authorizeRole } from "../../middleware/authorizeRole.js";
import { getDeletionRequestsController, approveUserDeletionController } from "./adminController.js";

const router = Router();

router.use(getUserMiddleware);
router.use(authorizeRole(["Admin"]))

router.get("/deletion-requests", getDeletionRequestsController);
router.post("/approve-delete", approveUserDeletionController);

export default router; 