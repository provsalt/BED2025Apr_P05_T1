import sharp from 'sharp';

/**
 * Middleware to resize and compress uploaded image
 * - Resizes to max 1024x1024 while maintaining aspect ratio
 * - Converts to JPEG for compatibility with OpenAI GPT-4 Vision API
 */
export const prepareImageForOpenAI = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file uploaded, move to next middleware
  }

  try {
    const resizedImage = await sharp(req.file.buffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside', // Preserve aspect ratio, don't crop
        withoutEnlargement: true, // Don't upscale small images
      })
      .jpeg({ quality: 80 }) // Compress and convert to JPEG
      .toBuffer();

    req.file.buffer = resizedImage;
    req.file.mimetype = 'image/jpeg';
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, ".jpg");

    next();
  } catch (error) {
    console.error("Image processing failed:", error);
    res.status(500).json({ error: "Failed to process image." });
  }
};
