import sharp from 'sharp';

export const compressImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const compressedImage = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    req.file.buffer = compressedImage;
    req.file.mimetype = 'image/webp';
    next();
  } catch (error) {
    next(error);
  }
};