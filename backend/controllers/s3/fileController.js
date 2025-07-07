import { getFile } from "../../services/s3Service.js";

// make everything public since we're not storing anything lese in the bucket.
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