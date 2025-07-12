import { randomUUID } from "crypto";
import { uploadFile } from "../../models/services/s3Service.js";
import { analyzeFoodImage } from "../../models/services/openaiService.js";
import { createMeal, getMealById, getAllMeals } from "../../models/nutrition/nutritionModel.js";

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
      name: analysisResult.foodName || "Unknown Food",
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

// Get all meals for the authenticated user
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

// Get a specific meal by ID
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
