import { randomUUID } from "crypto";
import { uploadFile } from "../../services/s3Service.js";
import { analyzeFoodImage } from "../../services/openai/openaiService.js";
import { createMeal, getMealById, getAllMeals, deleteMeal, updateMeal, searchMeals } from "../../models/nutrition/nutritionModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/nutrition/upload:
 *   post:
 *     tags:
 *       - Nutrition
 *     summary: Upload a food image for analysis
 *     description: Upload an image of a food item to be analyzed for nutritional information. The image is uploaded to S3, and the nutritional information is extracted using OpenAI.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Food image uploaded and analyzed successfully
 *       400:
 *         description: No file uploaded or error in analysis
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to upload food image
 */
export const uploadNutritionImage = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      throw ErrorFactory.validation("No file uploaded");
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw ErrorFactory.unauthorized("User not authenticated");
    }

    const filename = randomUUID().toString();
    const key = `nutrition-images/${filename}`;

    // Upload to S3
    await uploadFile(file, key);

    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + encodeURIComponent(key);

    // Analyze the food image with OpenAI
    let analysisResult = null;
    try {
      analysisResult = await analyzeFoodImage(file.buffer);
      if (analysisResult.error) {
        throw ErrorFactory.external("OpenAI", analysisResult.error, "Please ensure the image is clear and contains food items.");
      }
    } catch (analysisError) {
      next(analysisError);
    }

    const mealData = {
      name: analysisResult?.name || "Unknown Food",
      category: analysisResult?.category || "Unknown",
      carbohydrates: Number(analysisResult?.carbohydrates) || 0,
      protein: Number(analysisResult?.protein) || 0,
      fat: Number(analysisResult?.fat) || 0,
      calories: Math.ceil(Number(analysisResult?.calories) || 0), // Round up to nearest whole number
      ingredients: Array.isArray(analysisResult?.ingredients)
        ? analysisResult.ingredients.join(", ")
        : (analysisResult?.ingredients || ""),
      image_url: publicUrl,
      user_id: req.user.id
    };

    const newMeal = await createMeal(mealData);
    res.status(200).json({ 
      message: "Food image uploaded successfully", 
      url: publicUrl,
      s3Key: key,
      analysis: analysisResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/nutrition:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Retrieve all meals for the user
 *     description: Fetches a list of all meals that have been logged by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meals retrieved successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch meals
 */
export const retrieveMeals = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw ErrorFactory.unauthorized("User not authenticated");
    }

    const meals = await getAllMeals(req.user.id);
    res.status(200).json({ 
      message: "Meals retrieved successfully", 
      meals: meals || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/nutrition/{id}:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Retrieve a specific meal by ID
 *     description: Fetches the details of a specific meal by its ID. The user must be the owner of the meal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the meal to retrieve.
 *     responses:
 *       200:
 *         description: Meal retrieved successfully
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Failed to fetch meal
 */
export const retrieveMealsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw ErrorFactory.unauthorized("User not authenticated");
    }

    const meal = await getMealById(id);
    
    if (!meal) {
      throw ErrorFactory.notFound("Meal");
    }

    // Check if the meal belongs to the authenticated user
    if (meal.user_id !== req.user.id) {
      throw ErrorFactory.forbidden("Access denied");
    }

    res.status(200).json({ 
      message: "Meal retrieved successfully", 
      meal: meal 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/nutrition/{id}:
 *   delete:
 *     tags:
 *       - Nutrition
 *     summary: Delete a meal by ID
 *     description: Deletes a specific meal by its ID. The user must be the owner of the meal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the meal to delete.
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Failed to delete meal
 */
export const removeMeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw ErrorFactory.unauthorized("User not authenticated");
    }

    const meal = await getMealById(id);
    
    if (!meal) {
      throw ErrorFactory.notFound("Meal");
    }

    // Check if the meal belongs to the authenticated user
    if (meal.user_id !== req.user.id) {
      throw ErrorFactory.forbidden("Access denied");
    }

    await deleteMeal(id);
    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/nutrition/{id}:
 *   put:
 *     tags:
 *       - Nutrition
 *     summary: Update a meal by ID
 *     description: Updates the details of a specific meal by its ID. The user must be the owner of the meal.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the meal to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               carbohydrates:
 *                 type: number
 *               protein:
 *                 type: number
 *               fat:
 *                 type: number
 *               calories:
 *                 type: number
 *               ingredients:
 *                 type: string
 *     responses:
 *       200:
 *         description: Meal updated successfully
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Failed to update meal
 */


export const amendMeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mealData = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw ErrorFactory.unauthorized("User not authenticated");
    }

    const meal = await getMealById(id);
    
    if (!meal) {
      throw ErrorFactory.notFound("Meal");
    }

    // Check if the meal belongs to the authenticated user
    if (meal.user_id !== req.user.id) {
      throw ErrorFactory.forbidden("Access denied");
    }

    const updatedMeal = {
      ...req.body,
      ingredients: Array.isArray(req.body?.ingredients)
        ? req.body.ingredients.join(", ")
        : req.body?.ingredients
    };

    await updateMeal(id, updatedMeal);
    res.status(200).json({ message: "Meal updated successfully" });
  } catch (error) {
    next(error);
  }
}

/**
 * @openapi
 * /api/nutrition/search:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Search meals by name
 *     description: Returns meals for the authenticated user whose name contains the search term (case-insensitive, partial match).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The search term to look for in meal names.
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 meals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       carbohydrates:
 *                         type: number
 *                       protein:
 *                         type: number
 *                       fat:
 *                         type: number
 *                       calories:
 *                         type: number
 *                       ingredients:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                       user_id:
 *                         type: integer
 *                 searchTerm:
 *                   type: string
 *                 count:
 *                   type: integer
 *       400:
 *         description: Search term is required
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to search meals
 *       404:
 *         description: No meals found for the given search term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
              properties:
 *                 error:
 *                   type: string
 *                 searchTerm:
 *                   type: string
 */

export const searchMealsController = async (req, res, next) => {
  try {
    const { name: searchTerm } = req.query;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw ErrorFactory.unauthorized("User not authenticated");
    }

    // Check if search term is provided
    if (!searchTerm || searchTerm.trim() === "") {
      throw ErrorFactory.validation("Search term is required");
    }

    const meals = await searchMeals(req.user.id, searchTerm.trim());
    
    if (!meals || meals.length === 0) {
      throw ErrorFactory.notFound("Meals");
    }

    res.status(200).json({ 
      message: "Search completed successfully", 
      meals: meals,
      searchTerm: searchTerm.trim(),
      count: meals.length
    });
  } catch (error) {
    next(error);
  }
};

