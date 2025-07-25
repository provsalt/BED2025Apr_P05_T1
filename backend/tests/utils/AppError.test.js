import { describe, it, expect } from "vitest";
import { AppError, ErrorFactory } from "../../utils/AppError.js";

describe("AppError", () => {
  it("should create an AppError with default values", () => {
    const error = new AppError("Test error");
    
    expect(error.name).toBe("AppError");
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(500);
    expect(error.category).toBe("unknown");
    expect(error.userMessage).toBe("Internal server error");
    expect(error.isOperational).toBe(true);
    expect(error.timestamp).toBeDefined();
  });

  it("should create an AppError with custom values", () => {
    const error = new AppError(
      "Custom error", 
      400, 
      "validation", 
      "Please fix your input",
      { field: "email" }
    );
    
    expect(error.message).toBe("Custom error");
    expect(error.statusCode).toBe(400);
    expect(error.category).toBe("validation");
    expect(error.userMessage).toBe("Please fix your input");
    expect(error.details).toEqual({ field: "email" });
  });

  it("should convert to JSON correctly", () => {
    const error = new AppError("Test error", 400, "validation");
    const json = error.toJSON();
    
    expect(json).toHaveProperty("name", "AppError");
    expect(json).toHaveProperty("message", "Test error");
    expect(json).toHaveProperty("statusCode", 400);
    expect(json).toHaveProperty("category", "validation");
    expect(json).toHaveProperty("timestamp");
    expect(json).toHaveProperty("stack");
  });
});

describe("ErrorFactory", () => {
  it("should create validation error", () => {
    const error = ErrorFactory.validation("Invalid email", { field: "email" });
    
    expect(error.statusCode).toBe(400);
    expect(error.category).toBe("validation");
    expect(error.userMessage).toBe("Please check your input and try again");
    expect(error.details).toEqual({ field: "email" });
  });

  it("should create unauthorized error", () => {
    const error = ErrorFactory.unauthorized();
    
    expect(error.statusCode).toBe(401);
    expect(error.category).toBe("auth");
    expect(error.userMessage).toBe("Please log in to access this resource");
  });

  it("should create forbidden error", () => {
    const error = ErrorFactory.forbidden();
    
    expect(error.statusCode).toBe(403);
    expect(error.category).toBe("auth");
    expect(error.userMessage).toBe("You do not have permission to access this resource");
  });

  it("should create not found error", () => {
    const error = ErrorFactory.notFound("User");
    
    expect(error.statusCode).toBe(404);
    expect(error.category).toBe("not_found");
    expect(error.userMessage).toBe("The requested user was not found");
  });

  it("should create conflict error", () => {
    const error = ErrorFactory.conflict("Email already exists");
    
    expect(error.statusCode).toBe(409);
    expect(error.category).toBe("conflict");
    expect(error.userMessage).toBe("Resource already exists");
  });

  it("should create database error", () => {
    const error = ErrorFactory.database("Connection failed");
    
    expect(error.statusCode).toBe(500);
    expect(error.category).toBe("database");
    expect(error.userMessage).toBe("Unable to process request at this time");
  });

  it("should create external service error", () => {
    const error = ErrorFactory.external("PaymentAPI", "Service unavailable");
    
    expect(error.statusCode).toBe(503);
    expect(error.category).toBe("external_service");
    expect(error.message).toBe("PaymentAPI: Service unavailable");
    expect(error.userMessage).toBe("External service unavailable");
  });

  it("should create file upload error", () => {
    const error = ErrorFactory.fileUpload("File too large");
    
    expect(error.statusCode).toBe(400);
    expect(error.category).toBe("file_upload");
    expect(error.userMessage).toBe("File upload failed");
  });

  it("should create rate limited error", () => {
    const error = ErrorFactory.rateLimited();
    
    expect(error.statusCode).toBe(429);
    expect(error.category).toBe("rate_limit");
    expect(error.userMessage).toBe("Too many requests. Please try again later");
  });
});