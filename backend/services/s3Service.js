import {PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { s3 } from "../config/s3Client.js";
import { trackS3Usage } from "./prometheusService.js";

/**
 * Uploads a file to S3.
 * @param {object} file - The file object from multer.
 * @param {string} key - The full key for the object in S3 (e.g., 'profile-pictures/user-123.jpg').
 * @returns {Promise<void>}
 */
export const uploadFile = async (file, key, userId = null) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  trackS3Usage(
    userId,
    "upload",
    process.env.S3_BUCKET_NAME,
    key,
    file.buffer?.length || file.size
  );
};

/**
 * Deletes a file from S3.
 * @param {string} key - The full key of the object to delete from S3.
 * @returns {Promise<void>}
 */
export const deleteFile = async (key, userId = null, fileSize = null) => {
  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  await s3.send(new DeleteObjectCommand(deleteParams));

  trackS3Usage(
    userId,
    "delete",
    process.env.S3_BUCKET_NAME,
    key,
    fileSize
  );
};

/**
 * Retrieves a file from S3.
 * @param {string} key - The full key of the object to retrieve from S3.
 * @returns {Promise<ReadableStream>}
 */
export const getFile = async (key, userId = null) => {
  const getParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const response = await s3.send(new GetObjectCommand(getParams));

  trackS3Usage(
    userId,
    "download",
    process.env.S3_BUCKET_NAME,
    key,
    response.ContentLength
  );

  return response.Body;
};

