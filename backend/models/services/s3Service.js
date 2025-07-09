import {PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3Client.js";

/**
 * Uploads a file to S3.
 * @param {object} file - The file object from multer.
 * @param {string} key - The full key for the object in S3 (e.g., 'profile-pictures/user-123.jpg').
 * @returns {Promise<void>}
 */
export const uploadFile = async (file, key) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));
};

/**
 * Deletes a file from S3.
 * @param {string} key - The full key of the object to delete from S3.
 * @returns {Promise<void>}
 */
export const deleteFile = async (key) => {
  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  await s3.send(new DeleteObjectCommand(deleteParams));
};

/**
 * Retrieves a file from S3.
 * @param {string} key - The full key of the object to retrieve from S3.
 * @returns {Promise<ReadableStream>}
 */
export const getFile = async (key) => {
  const getParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const { Body } = await s3.send(new GetObjectCommand(getParams));
  return Body;
};

