import { randomUUID } from "crypto";
import { uploadFile } from "../../services/s3Service.js";
import { analyzeFoodImage } from "../../services/openai/openaiService.js";
import { createMeal, getMealById, getAllMeals, deleteMeal, updateMeal, searchMeals } from "../../models/nutrition/nutritionModel.js";

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
export const uploadNutritionImage = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const filename = randomUUID().toString();
  const key = `nutrition-images/${filename}`;

  try {
    // Upload to S3
    await uploadFile(file, key);

    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + encodeURIComponent(key);

    // Analyze the food image with OpenAI
    let analysisResult = null;
    try {
      analysisResult = await analyzeFoodImage(file.buffer);
      if (analysisResult.error) {
        return res.status(400).json({ error: analysisResult.error });
      }
    } catch (analysisError) {
      // Continue with upload even if analysis fails
    }

    const mealData = {
      name: analysisResult.name || "Unknown Food",
      category: analysisResult.category || "Unknown",
      carbohydrates: Number(analysisResult.carbohydrates) || 0,
      protein: Number(analysisResult.protein) || 0,
      fat: Number(analysisResult.fat) || 0,
      calories: Math.ceil(Number(analysisResult.calories) || 0), // Round up to nearest whole number
      ingredients: Array.isArray(analysisResult.ingredients)
        ? analysisResult.ingredients.join(", ")
        : (analysisResult.ingredients || ""),
      image_url: publicUrl,
      user_id: req.user.id
    };

    try {
      const newMeal = await createMeal(mealData);
      res.status(200).json({ 
        message: "Food image uploaded successfully", 
        url: publicUrl,
        s3Key: key,
        analysis: analysisResult
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to upload food image: " + err.message });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to upload food image" });
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
export const retrieveMeals = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const meals = await getAllMeals(req.user.id);
    res.status(200).json({ 
      message: "Meals retrieved successfully", 
      meals: meals 
    });
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
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
export const retrieveMealsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const meal = await getMealById(id);
    
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Check if the meal belongs to the authenticated user
    if (meal.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({ 
      message: "Meal retrieved successfully", 
      meal: meal 
    });
  } catch (error) {
    console.error("Error fetching meal:", error);
    res.status(500).json({ error: "Failed to fetch meal" });
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
export const removeMeal = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const meal = await getMealById(id);
    
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Check if the meal belongs to the authenticated user
    if (meal.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await deleteMeal(id);
    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal:", error);
    res.status(500).json({ error: "Failed to delete meal" });
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


export const amendMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const mealData = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const meal = await getMealById(id);
    
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Check if the meal belongs to the authenticated user
    if (meal.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedMeal = {
      ...req.validatedBody,
      ingredients: Array.isArray(req.validatedBody.ingredients)
        ? req.validatedBody.ingredients.join(", ")
        : req.validatedBody.ingredients
    };

    await updateMeal(id, updatedMeal);
    res.status(200).json({ message: "Meal updated successfully" });
  } catch (error) {
    console.error("Error updating meal:", error);
    res.status(400).json({ error: "Failed to update meal" });
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

export const searchMealsController = async (req, res) => {
  try {
    const { name: searchTerm } = req.query;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if search term is provided
    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).json({ error: "Search term is required" });
    }

    const meals = await searchMeals(req.user.id, searchTerm.trim());
    
    if (!meals || meals.length === 0) {
      return res.status(404).json({
        error: "No meals found for the given search term",
        searchTerm: searchTerm.trim()
      });
    }

    res.status(200).json({ 
      message: "Search completed successfully", 
      meals: meals,
      searchTerm: searchTerm.trim(),
      count: meals.length
    });
  } catch (error) {
    console.error("Error searching meals:", error);
    res.status(500).json({ error: "Failed to search meals" });
  }
};

