import crypto from "crypto";
import { uploadFile, deleteFile } from "../../models/services/s3Service.js";

// Example: POST /api/nutrition/upload-image
export const uploadNutritionImage = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const ext = file.originalname.split('.').pop();
  const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');
  const filename = `${fileHash}.${ext}`;
  const key = `nutrition-images/${filename}`;

  try {
    await uploadFile(file, key);

    const newUrl = `nutrition-images/${filename}`;
    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + newUrl;

    res.status(200).json({ 
      message: "Food image uploaded successfully", 
      url: publicUrl,
      s3Key: key
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload food image" });
  }
};