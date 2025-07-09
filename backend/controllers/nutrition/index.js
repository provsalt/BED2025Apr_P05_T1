import { Router } from "express";
import { createUploadMiddleware } from "../../middleware/upload.js";
import { validateImageType } from "../../middleware/validateImage.js";
import { resizeAndConvertImage } from "../../middleware/resizeAndConvertImage.js";
import { compressImage } from "../../middleware/compression.js";
import { uploadNutritionImage } from "./foodImageController.js";

const router = Router();

const upload = createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 5 * 1024 * 1024,
});
//Post route for uploading food images
router.post(
  "/food/upload",
  upload.single("image"),
  validateImageType,
  resizeAndConvertImage,
  compressImage,
  uploadNutritionImage
);

export default router;
