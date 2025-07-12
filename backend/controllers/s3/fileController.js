import { getFile } from "../../services/s3Service.js";

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
export const getFileByKey = async (req, res) => {
  try {
    const { key } = req.query;
    const fileStream = await getFile(key);

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving file from S3:", error);
    res.status(500).send("Error retrieving file");
  }
};