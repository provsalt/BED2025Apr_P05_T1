import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFile, deleteFile, getFile } from "../../services/s3Service.js";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

vi.mock("../../config/s3Client.js", () => ({
    s3: {
        send: vi.fn(),
    },
}));

vi.mock("@aws-sdk/client-s3", () => ({
    PutObjectCommand: vi.fn(),
    DeleteObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
}));

vi.mock("../../services/prometheusService.js", () => ({
    trackS3Usage: vi.fn(),
}));

import { s3 } from "../../config/s3Client.js";

describe("S3 Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // set the environment variables
        process.env.S3_BUCKET_NAME = "test-bucket";
    });

    describe("uploadFile", () => {
        it("should upload a file to S3 successfully", async () => {
            const mockFile = {
                buffer: Buffer.from("test file content"),
                mimetype: "image/jpeg",
            };
            const key = "test-folder/test-file.jpg";

            s3.send.mockResolvedValue({});

            await uploadFile(mockFile, key);

            expect(PutObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
                Body: mockFile.buffer,
                ContentType: mockFile.mimetype,
            });
            expect(s3.send).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if S3 upload fails", async () => {
            const mockFile = {
                buffer: Buffer.from("test file content"),
                mimetype: "image/jpeg",
            };
            const key = "test-folder/test-file.jpg";
            const error = new Error("S3 upload failed");

            s3.send.mockRejectedValue(error);

            await expect(uploadFile(mockFile, key)).rejects.toThrow("S3 upload failed");
            expect(s3.send).toHaveBeenCalledTimes(1);
        });

        it("should handle different file types", async () => {
            const mockFile = {
                buffer: Buffer.from("test pdf content"),
                mimetype: "application/pdf",
            };
            const key = "documents/test-file.pdf";

            s3.send.mockResolvedValue({});

            await uploadFile(mockFile, key);

            expect(PutObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
                Body: mockFile.buffer,
                ContentType: "application/pdf",
            });
        });
    });

    describe("deleteFile", () => {
        it("should delete a file from S3 successfully", async () => {
            const key = "test-folder/test-file.jpg";

            s3.send.mockResolvedValue({});

            await deleteFile(key);

            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
            });
            expect(s3.send).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if S3 delete fails", async () => {
            const key = "test-folder/test-file.jpg";
            const error = new Error("S3 delete failed");

            s3.send.mockRejectedValue(error);

            await expect(deleteFile(key)).rejects.toThrow("S3 delete failed");
            expect(s3.send).toHaveBeenCalledTimes(1);
        });

        it("should handle deletion of non-existent files", async () => {
            const key = "non-existent/file.jpg";

            s3.send.mockResolvedValue({});

            await deleteFile(key);

            expect(DeleteObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
            });
            expect(s3.send).toHaveBeenCalledTimes(1);
        });
    });

    describe("getFile", () => {
        it("should retrieve a file from S3 successfully", async () => {
            const key = "test-folder/test-file.jpg";
            const mockBody = "mock file content";

            s3.send.mockResolvedValue({ Body: mockBody });

            const result = await getFile(key);

            expect(GetObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
            });
            expect(s3.send).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockBody);
        });

        it("should throw an error if S3 get fails", async () => {
            const key = "test-folder/test-file.jpg";
            const error = new Error("S3 get failed");

            s3.send.mockRejectedValue(error);

            await expect(getFile(key)).rejects.toThrow("S3 get failed");
            expect(s3.send).toHaveBeenCalledTimes(1);
        });

        it("should handle getting non-existent files", async () => {
            const key = "non-existent/file.jpg";
            const error = new Error("NoSuchKey");

            s3.send.mockRejectedValue(error);

            await expect(getFile(key)).rejects.toThrow("NoSuchKey");
            expect(GetObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
            });
        });

        it("should return the correct body for different file types", async () => {
            const key = "documents/test-file.pdf";
            const mockBody = Buffer.from("pdf content");

            s3.send.mockResolvedValue({ Body: mockBody });

            const result = await getFile(key);

            expect(result).toBe(mockBody);
            expect(GetObjectCommand).toHaveBeenCalledWith({
                Bucket: "test-bucket",
                Key: key,
            });
        });
    });

    describe("Environment variable handling", () => {
        it("should use the correct bucket name from environment", async () => {
            process.env.S3_BUCKET_NAME = "custom-bucket-name";
            const mockFile = {
                buffer: Buffer.from("test"),
                mimetype: "text/plain",
            };

            s3.send.mockResolvedValue({});

            await uploadFile(mockFile, "test.txt");

            expect(PutObjectCommand).toHaveBeenCalledWith({
                Bucket: "custom-bucket-name",
                Key: "test.txt",
                Body: mockFile.buffer,
                ContentType: "text/plain",
            });
        });
    });
});