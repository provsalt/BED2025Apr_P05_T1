
import { Router } from "express";
import {
  createUserController,
  getCurrentUserController,
  loginUserController,
  changePasswordController,
  getUserController,
  updateUserController,
  uploadUserProfilePictureController,
  deleteUserProfilePictureController, deleteUserController
} from "./userController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { createUploadMiddleware } from "../../middleware/upload.js";
import { compressImage } from "../../middleware/compression.js";
import { authRateLimit } from "../../middleware/rateLimit.js";
import {
  bulkUpdateUserRolesController,
  getUsersByRoleController,
  updateUserRoleController
} from "./userRoleController.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";

const router = Router();

router.post("/", authRateLimit, createUserController);
router.post("/login", authRateLimit, loginUserController);
router.get("/", getUserMiddleware, getCurrentUserController);

router.get("/:id", getUserController);
router.put("/:id", getUserMiddleware, updateUserController);

router.put("/:id/password", getUserMiddleware, changePasswordController);

router.post("/picture", getUserMiddleware, createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 8 * 1024 * 1024,
}).single("avatar"), compressImage, uploadUserProfilePictureController);
router.delete("/picture", getUserMiddleware, deleteUserProfilePictureController);


router.delete("/users/:id", getUserMiddleware, authorizeRole(["Admin"]), deleteUserController);
router.put("/:id/role", getUserMiddleware, authorizeRole(["Admin"]), updateUserRoleController);
router.get("/role/:role", getUserMiddleware, authorizeRole(["Admin"]), getUsersByRoleController);
router.put("/role/bulk", getUserMiddleware, authorizeRole(["Admin"]), bulkUpdateUserRolesController);

export default router;
