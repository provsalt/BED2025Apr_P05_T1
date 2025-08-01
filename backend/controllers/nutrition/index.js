import { Router } from "express";
import {genericUploadMiddleware} from "../../middleware/upload.js";
import { resizeAndConvertImage } from "../../middleware/resizeAndConvertImage.js";
import { compressImage } from "../../middleware/compression.js";
import { uploadNutritionImage, retrieveMeals, retrieveMealsById, removeMeal, amendMeal, searchMealsController } from "./mealImageController.js";
import { getNutritionAnalyticsController, getDailyBreakdownController, getCaloriesTrendController } from "./nutritionAnalyticsController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import {openaiRateLimit} from "../../middleware/rateLimit.js";
import { nutritionSchema } from "../../utils/validation/nutrition.js";
import {validateQuery, validateSchema} from "../../middleware/validateSchema.js";
import { z } from "zod";

const router = Router();

router.use(getUserMiddleware);

//Post route for uploading food images
router.post(
  "/upload",
  openaiRateLimit,
  getUserMiddleware,
  genericUploadMiddleware.single('image'),
  resizeAndConvertImage,
  compressImage,
  uploadNutritionImage
);
// Get route for fetching all meals for the user
router.get("/", retrieveMeals);

// Analytics routes - must come before search route to avoid conflicts
router.get("/analytics", getNutritionAnalyticsController);
router.get("/analytics/daily", getDailyBreakdownController);
router.get("/analytics/trend", getCaloriesTrendController);


// Search route for searching meals
router.get("/search", searchMealsController);

// Get route for fetching a specific meal by ID
router.get("/:id", retrieveMealsById);

// Delete route for deleting a meal by ID
router.delete("/:id", removeMeal);

// Update route for updating a meal by ID
router.put("/:id", validateSchema(nutritionSchema), amendMeal);

export default router;