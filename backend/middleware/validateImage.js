const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
];

/**
 * Middleware to validate uploaded image type and size
 * Only allows JPEG, JPG, PNG, and WEBP images, and size ≤ 30MB
 */
export const validateImageType = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { mimetype, originalname, size } = req.file;
  const isAllowedMime = allowedMimeTypes.includes(mimetype);
  const isAllowedExt = /\.(jpeg|jpg|png|webp)$/i.test(originalname);

  if (!isAllowedMime || !isAllowedExt) {
    return res.status(400).json({
      error: "Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed.",
      
    });
  }

  if (size > 30 * 1024 * 1024) {
    return res.status(400).json({
      error: "Image size should be less than 30MB.",
    });
  }

  next();
};
