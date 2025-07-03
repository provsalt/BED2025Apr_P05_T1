import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3Client.js";
import dotenv from "dotenv";
import sql from "mssql";
import { dbConfig } from "../config/db.js";

dotenv.config();

/**
 * Upload profile picture for a user and update DB with the image URL.
 * @route POST /api/user/:id/picture
 * @access Protected (Requires Bearer token)
 */
export const uploadProfilePictureController = async (req, res) => {
    const userId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

    const filename = `${Date.now()}-${file.originalname}`;
    const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `profile-pictures/${filename}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read", // Optional: allows direct URL access
    };

    try {
        // Upload file to S3/MinIO
        await s3.send(new PutObjectCommand(uploadParams));

        const fileUrl = `${process.env.S3_PUBLIC_URL}/profile-pictures/${filename}`;

        // Update database with image URL
        const db = await sql.connect(dbConfig);
        await db
        .request()
        .input("id", userId)
        .input("url", fileUrl)
        .query("UPDATE Users SET profile_picture_url = @url WHERE id = @id");

        res.status(200).json({
        message: "Upload successful",
        url: fileUrl,
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
    };
