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

export const profilePictureUpload = createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  fileSize: 8 * 1024 * 1024
}).single("avatar");