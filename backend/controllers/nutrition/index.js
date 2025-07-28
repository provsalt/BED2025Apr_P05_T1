import { Router } from "express";
import {genericUploadMiddleware} from "../../middleware/upload.js";
import { resizeAndConvertImage } from "../../middleware/resizeAndConvertImage.js";
import { compressImage } from "../../middleware/compression.js";
import { uploadNutritionImage, retrieveMeals, retrieveMealsById, removeMeal, amendMeal, searchMealsController } from "./mealImageController.js";
import { getNutritionAnalyticsController, getDailyBreakdownController, getCaloriesTrendController } from "./nutritionAnalyticsController.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import {openaiRateLimit} from "../../middleware/rateLimit.js";
import { nutritionSchema } from "../../utils/validation/nutrition.js";
import { validateSchema } from "../../middleware/validateSchema.js";

const router = Router();

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
router.get("/", getUserMiddleware, retrieveMeals);

// Analytics routes - must come before search route to avoid conflicts
router.get("/analytics", getUserMiddleware, getNutritionAnalyticsController);
router.get("/analytics/daily", getUserMiddleware, getDailyBreakdownController);
router.get("/analytics/trend", getUserMiddleware, getCaloriesTrendController);

// Search route for searching meals
router.get("/search", getUserMiddleware, searchMealsController);

// Get route for fetching a specific meal by ID
router.get("/:id", getUserMiddleware, retrieveMealsById);

// Delete route for deleting a meal by ID
router.delete("/:id", getUserMiddleware, removeMeal);

// Update route for updating a meal by ID
router.put("/:id", getUserMiddleware, validateSchema(nutritionSchema), amendMeal);

export default router;