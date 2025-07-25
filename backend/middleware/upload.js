import multer from 'multer';
import { ErrorFactory } from '../utils/AppError.js';

export const createUploadMiddleware = (options) => {
  const { allowedMimeTypes, fileSize } = options;

  return multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const error = ErrorFactory.fileUpload(
          `Invalid file type: ${file.mimetype}`,
          `Only ${allowedMimeTypes.join(', ')} files are allowed`
        );
        cb(error, false);
      }
    },
    limits: { fileSize: fileSize },
  });
};

export const genericUploadMiddleware = createUploadMiddleware({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  fileSize: 30 * 1024 * 1024,
});