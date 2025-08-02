
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
  getAllUsersController,
  requestUserDeletionController,
  cancelUserDeletionController
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
import {
  getUserLoginAnalyticsController,
  getUserRecentLoginAttemptsController,
  getUserFailedLoginAttemptsController,
  getLoginAttemptsByEmailController,
  getOverallLoginAnalyticsController
} from "./loginAnalyticsController.js";
import {Password, User} from "../../utils/validation/user.js";
import {validateSchema} from "../../middleware/validateSchema.js";
import { z } from "zod/v4";

const router = Router();

// Raymond signup, login, get current user
router.post("/", authRateLimit, validateSchema(User), createUserController);
router.get("/", getUserMiddleware, authorizeRole(["Admin"]), getAllUsersController);
router.post("/login", authRateLimit, validateSchema(z.object({
  email: z.email().max(255),
  password: Password
})), loginUserController);
router.get("/me", getUserMiddleware, getCurrentUserController);

// Shun Xiang user's login history and password change under 
router.get("/me/login-history", getUserMiddleware, getUserLoginHistoryController);
router.put("/me/password", getUserMiddleware, changePasswordController);

// Shun Xiang upload profile picture, delete profile picture
router.post("/me/picture", getUserMiddleware, genericUploadMiddleware.single("avatar"), compressImage, uploadUserProfilePictureController);
router.delete("/me/picture", getUserMiddleware, deleteUserProfilePictureController);

router.post("/me/request-delete", getUserMiddleware, requestUserDeletionController);
router.post("/me/cancel-delete", getUserMiddleware, cancelUserDeletionController);

// Shun Xiang get by id, update user
router.get("/:id", getUserController);
router.put("/:id", getUserMiddleware, updateUserController);

// Dylan delete user,
router.delete("/:id", getUserMiddleware, authorizeRole(["Admin"]), deleteUserController);
router.put("/:id/role", getUserMiddleware, authorizeRole(["Admin"]), updateUserRoleController);

// Dylan get users by role, bulk update user roles (admin only)
router.get("/role/:role", getUserMiddleware, authorizeRole(["Admin"]), getUsersByRoleController);
router.put("/role/bulk", getUserMiddleware, authorizeRole(["Admin"]), bulkUpdateUserRolesController);

// Login Analytics Routes
// User-specific analytics (users can view their own data)
router.get("/:userId/login-analytics", getUserMiddleware, getUserLoginAnalyticsController);
router.get("/:userId/login-attempts", getUserMiddleware, getUserRecentLoginAttemptsController);
router.get("/:userId/failed-login-attempts", getUserMiddleware, getUserFailedLoginAttemptsController);

// Admin-only analytics
router.get("/analytics/login-attempts-by-email", getUserMiddleware, authorizeRole(["Admin"]), getLoginAttemptsByEmailController);
router.get("/analytics/overall-login-stats", getUserMiddleware, authorizeRole(["Admin"]), getOverallLoginAnalyticsController);

export default router;
