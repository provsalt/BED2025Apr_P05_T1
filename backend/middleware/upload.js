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

export const genericUploadMiddleware = createUploadMiddleware({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  fileSize: 30 * 1024 * 1024,
});