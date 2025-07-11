import sharp from 'sharp';

/**
 * Middleware to resize, convert, and compress uploaded images to JPEG format
 * - Resizes to max 1024x1024 while maintaining aspect ratio
 * - Converts webp, png, jpg, jpeg to JPEG
 * - Compresses to quality 80
 */
export const resizeAndConvertImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedTypes = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return next(); // Not a supported type, skip conversion
  }

  try {
    const processedBuffer = await sharp(req.file.buffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    req.file.buffer = processedBuffer;
    req.file.mimetype = 'image/jpeg';
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, '.jpg');
    next();
  } catch (error) {
    console.error('Image resize/convert to JPEG failed:', error);
    res.status(500).json({ error: 'Failed to process image.' });
  }
}; 