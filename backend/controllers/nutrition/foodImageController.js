import { randomUUID } from "crypto";
import { uploadFile, deleteFile } from "../../models/services/s3Service.js";

export const uploadNutritionImage = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const ext = file.originalname.split('.').pop();
  const filename = `${randomUUID()}.${ext}`;
  const key = `nutrition-images/${filename}`;

  try {
    await uploadFile(file, key);

    const newUrl = `nutrition-images/${filename}`;
    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + encodeURIComponent(newUrl);

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
