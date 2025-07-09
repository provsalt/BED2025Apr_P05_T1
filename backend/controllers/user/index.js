
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

const router = Router();

router.post("/", createUserController);
router.post("/login", loginUserController);
router.get("/", getUserMiddleware, getCurrentUserController);

router.get("/:id", getUserController);
router.put("/:id", getUserMiddleware, updateUserController);

router.put("/:id/password", getUserMiddleware, changePasswordController);

router.post("/:id/picture", getUserMiddleware, createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 8 * 1024 * 1024,
}).single("avatar"), compressImage, uploadUserProfilePictureController);
router.delete("/:id/picture", getUserMiddleware, deleteUserProfilePictureController);

export default router;
