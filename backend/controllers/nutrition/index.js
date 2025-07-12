import { Router } from "express";
import { createUploadMiddleware } from "../../middleware/upload.js";
import { validateImageType } from "../../middleware/validateImage.js";
import { resizeAndConvertImage } from "../../middleware/resizeAndConvertImage.js";
import { compressImage } from "../../middleware/compression.js";
import { uploadNutritionImage, retrieveMeals, retrieveMealsById, removeMeal, amendMeal } from "./mealImageController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import {openaiRateLimit} from "../../middleware/rateLimit.js";

const router = Router();

const upload = createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 5 * 1024 * 1024,
});
//Post route for uploading food images
router.post(
"/upload", openaiRateLimit, getUserMiddleware,upload.single("image"),
validateImageType,resizeAndConvertImage,compressImage,uploadNutritionImage
);
// Get route for fetching all meals for the user
router.get("/", getUserMiddleware, retrieveMeals);

// Get route for fetching a specific meal by ID
router.get("/:id", getUserMiddleware, retrieveMealsById);

// Delete route for deleting a meal by ID
router.delete("/:id", getUserMiddleware, removeMeal);

// Update route for updating a meal by ID
router.put("/:id", getUserMiddleware, amendMeal);

export default router;