import { Router } from "express";
import { createUploadMiddleware } from "../../middleware/upload.js";
import { validateImageType } from "../../middleware/validateImage.js";
import { prepareImageForOpenAI } from "../../middleware/resizeAndConvertImage.js";
import { compressImage } from "../../middleware/compression.js";
import { uploadNutritionImage } from "./foodImageController.js";

const router = Router();

const upload = createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 5 * 1024 * 1024,
});

router.post(
  "/food/upload",
  upload.single("image"),
  validateImageType,
  prepareImageForOpenAI,
  compressImage,
  uploadNutritionImage
);

export default router;
