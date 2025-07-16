
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
import {genericUploadMiddleware} from "../../middleware/upload.js";
import { compressImage } from "../../middleware/compression.js";
import { authRateLimit } from "../../middleware/rateLimit.js";
import {
  bulkUpdateUserRolesController,
  getUsersByRoleController,
  updateUserRoleController
} from "./userRoleController.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";
import { getUserLoginHistoryController } from "./loginHistoryController.js";

const router = Router();

// Raymond signup, login, get current user
router.post("/", authRateLimit, createUserController);
router.get("/", getUserMiddleware, authorizeRole(["Admin"]), getAllUsersController);
router.post("/login", authRateLimit, loginUserController);
router.get("/me", getUserMiddleware, getCurrentUserController);

// Shun Xiang user's login history and password change under 
router.get("/me/login-history", getUserMiddleware, getUserLoginHistoryController);
router.put("/me/password", getUserMiddleware, changePasswordController);

// Shun Xiang upload profile picture, delete profile picture
router.post("/me/picture", getUserMiddleware, genericUploadMiddleware.single("avatar"), compressImage, uploadUserProfilePictureController);
router.delete("/me/picture", getUserMiddleware, deleteUserProfilePictureController);

// Shun Xiang get by id, update user
router.get("/:id", getUserController);
router.put("/:id", getUserMiddleware, updateUserController);

// Dylan delete user,
router.delete("/:id", getUserMiddleware, authorizeRole(["Admin"]), deleteUserController);
router.put("/:id/role", getUserMiddleware, authorizeRole(["Admin"]), updateUserRoleController);

// Dylan get users by role, bulk update user roles (admin only)
router.get("/role/:role", getUserMiddleware, authorizeRole(["Admin"]), getUsersByRoleController);
router.put("/role/bulk", getUserMiddleware, authorizeRole(["Admin"]), bulkUpdateUserRolesController);

export default router;
