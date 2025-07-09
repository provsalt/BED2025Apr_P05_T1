
import { Router } from "express";
import {
  createUserController,
  getCurrentUserController,
  loginUserController,
  changePasswordController,
  getUserController,
  updateUserController,
  uploadUserProfilePictureController,
  deleteUserProfilePictureController
} from "./userController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { createUploadMiddleware } from "../../middleware/upload.js";
import { compressImage } from "../../middleware/compression.js";
import { authRateLimit } from "../../middleware/rateLimit.js";

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

export default router;
