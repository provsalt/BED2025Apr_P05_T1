import { randomUUID } from "crypto";
import { uploadFile, deleteFile } from "../../models/services/s3Service.js";
import { analyzeFoodImage } from "../../models/services/openaiService.js";
import { createmeal } from "../../models/nutrition/nutritionModel.js";

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
    } catch (analysisError) {
      // Continue with upload even if analysis fails
    }

    const mealData = {
      name: analysisResult.foodName,
      category: analysisResult.category,
      carbohydrates: Number(analysisResult.carbohydrates),
      protein: Number(analysisResult.protein),
      fat: Number(analysisResult.fat),
      calories: Number(analysisResult.calories),
      ingredients: Array.isArray(analysisResult.ingredients)
        ? analysisResult.ingredients.join(", ")
        : (analysisResult.ingredients || ""),
      image_url: publicUrl,
      user_id: req.user.id
    };

    try {
      const newMeal = await createmeal(mealData);
      res.status(200).json({ 
        message: "Food image uploaded successfully", 
        url: publicUrl,
        s3Key: key,
        analysis: analysisResult
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload food image" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to upload food image" });
  }
};
