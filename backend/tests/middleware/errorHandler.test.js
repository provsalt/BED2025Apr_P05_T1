import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorHandler } from "../../middleware/errorHandler.js";
import { AppError } from "../../utils/AppError.js";

describe("errorHandler", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      originalUrl: "/api/test",
      user: { id: 1 },
      ip: "127.0.0.1",
      traceId: "test-trace-id",
      get: vi.fn().mockReturnValue("test-user-agent")
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
  });

  it("should handle AppError correctly", () => {
    const error = new AppError("Test error", 400, "validation", "Invalid input");
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid input",
      traceId: "test-trace-id"
    });
  });

  it("should handle ZodError correctly", () => {
    const error = {
      name: "ZodError",
      issues: [
        { path: ["email"], message: "Invalid email format" },
        { path: ["password"], message: "Password too short" }
      ]
    };
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid input data",
      details: [
        { field: "email", message: "Invalid email format" },
        { field: "password", message: "Password too short" }
      ],
      traceId: "test-trace-id"
    });
  });

  it("should handle JsonWebTokenError correctly", () => {
    const error = { name: "JsonWebTokenError" };
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid authentication token",
      traceId: "test-trace-id"
    });
  });

  it("should handle file size limit error correctly", () => {
    const error = { code: "LIMIT_FILE_SIZE" };
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "File size too large",
      traceId: "test-trace-id"
    });
  });

  it("should handle unexpected errors", () => {
    const error = new Error("Unexpected error");
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error",
      traceId: "test-trace-id"
    });
  });

  it("should include debug info in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    
    const error = new AppError("Test error", 400, "validation", "Invalid input", { field: "email" });
    
    errorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid input",
      details: { field: "email" },
      stack: expect.any(String),
      traceId: "test-trace-id"
    });

    process.env.NODE_ENV = originalEnv;
  });
});