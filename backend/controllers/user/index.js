
import { Router } from "express";
import {
  createUserController,
  getCurrentUserController,
  loginUserController,
  changePasswordController,
  getUserController,
  updateUserController,
  uploadUserProfilePictureController,
  deleteUserProfilePictureController,
  deleteUserController,
  getAllUsersController
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

// Raymond signup, login, get current user
router.post("/", authRateLimit, createUserController);
router.get("/", getUserMiddleware, authorizeRole(["Admin"]), getAllUsersController);
router.post("/login", authRateLimit, loginUserController);
router.get("/me", getUserMiddleware, getCurrentUserController);

// Shun Xiang get by id, update user
router.get("/:id", getUserController);
router.put("/:id", getUserMiddleware, updateUserController);
// Dylan delete user,
router.delete("/:id", getUserMiddleware, authorizeRole(["Admin"]), deleteUserController);
router.put("/:id/role", getUserMiddleware, authorizeRole(["Admin"]), updateUserRoleController);

// Shun Xiang change password, upload profile picture, delete profile picture
router.put("/me/password", getUserMiddleware, changePasswordController);
router.post("/me/picture", getUserMiddleware, createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 8 * 1024 * 1024,
}).single("avatar"), compressImage, uploadUserProfilePictureController);
router.delete("/me/picture", getUserMiddleware, deleteUserProfilePictureController);

// Dylan get users by role, bulk update user roles (admin only)
router.get("/role/:role", getUserMiddleware, authorizeRole(["Admin"]), getUsersByRoleController);
router.put("/role/bulk", getUserMiddleware, authorizeRole(["Admin"]), bulkUpdateUserRolesController);


export default router;
