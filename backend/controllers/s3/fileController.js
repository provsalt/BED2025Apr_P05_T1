import { getFile } from "../../services/s3Service.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/s3:
 *   get:
 *     tags:
 *       - S3
 *     summary: Get a file from S3 by key
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File stream
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error retrieving file
 */
// make everything public since we're not storing anything else in the bucket.
export const getFileByKey = async (req, res, next) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      throw ErrorFactory.validation("File key is required");
    }

    const fileStream = await getFile(key);
    fileStream.pipe(res);
  } catch (error) {
    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey") {
      return next(ErrorFactory.notFound("File"));
    }
    
    if (error.name === "AccessDenied" || error.Code === "AccessDenied") {
      return next(ErrorFactory.forbidden("Access to file denied"));
    }
    
    if (error.isOperational) {
      return next(error);
    }
    
    next(ErrorFactory.external("S3", error.message, "Unable to retrieve file at this time"));
  }
};