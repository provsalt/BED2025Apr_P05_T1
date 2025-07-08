import { randomUUID } from "crypto";
import { uploadFile, deleteFile } from "../../models/services/s3Service.js";
import { analyzeFoodImage } from "../../models/services/openaiService.js";

export const uploadNutritionImage = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const ext = file.originalname.split('.').pop();
  const filename = `${randomUUID()}.${ext}`;
  const key = `nutrition-images/${filename}`;

  try {
    // Upload to S3
    await uploadFile(file, key);

    const newUrl = `nutrition-images/${filename}`;
    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + encodeURIComponent(newUrl);

    // Analyze the food image with OpenAI
    let analysisResult = null;
    try {
      analysisResult = await analyzeFoodImage(file.buffer);
    } catch (analysisError) {
      console.error("OpenAI analysis failed:", analysisError);
      // Continue with upload even if analysis fails
    }

    res.status(200).json({ 
      message: "Food image uploaded successfully", 
      url: publicUrl,
      s3Key: key,
      analysis: analysisResult
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload food image" });
  }
};
