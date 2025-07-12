import multer from 'multer';

export const createUploadMiddleware = (options) => {
  const { allowedMimeTypes, fileSize } = options;

  return multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`), false);
      }
    },
    limits: { fileSize: fileSize },
  });
};

/**
 * Dedicated middleware for profile picture uploads
 * Encapsulates all validation logic for profile pictures
 */
export const profilePictureUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed."), false);
    }
  },
  limits: { 
    fileSize: 8 * 1024 * 1024 // 8MB limit for profile pictures
  },
}).single("avatar");