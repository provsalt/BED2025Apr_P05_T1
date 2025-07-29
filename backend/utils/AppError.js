export class AppError extends Error {
  constructor(message, statusCode = 500, category = "unknown", userMessage = null, details = null) {
    super(message);
    
    this.name = "AppError";
    this.statusCode = statusCode;
    this.category = category;
    this.userMessage = userMessage || this.getDefaultUserMessage(statusCode);
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  getDefaultUserMessage(statusCode) {
    const defaultMessages = {
      400: "Invalid request data",
      401: "Authentication required",
      403: "Access denied",
      404: "Resource not found",
      409: "Resource already exists",
      422: "Invalid data provided",
      429: "Too many requests",
      500: "Internal server error",
      503: "Service temporarily unavailable"
    };
    
    return defaultMessages[statusCode] || "Something went wrong";
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      category: this.category,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

export class ErrorFactory {
  static validation(message, details = null) {
    return new AppError(
      message,
      400,
      "validation",
      "Please check your input and try again",
      details
    );
  }
  
  static unauthorized(message = "Authentication required") {
    return new AppError(
      message,
      401,
      "auth",
      "Please log in to access this resource"
    );
  }
  
  static forbidden(message = "Access denied") {
    return new AppError(
      message,
      403,
      "auth",
      "You do not have permission to access this resource"
    );
  }
  
  static notFound(resource = "Resource") {
    return new AppError(
      `${resource} not found`,
      404,
      "not_found",
      `The requested ${resource.toLowerCase()} was not found`
    );
  }
  
  static conflict(message, userMessage = null) {
    return new AppError(
      message,
      409,
      "conflict",
      userMessage || "Resource already exists"
    );
  }
  
  static database(message, userMessage = "Unable to process request at this time") {
    return new AppError(
      message,
      500,
      "database",
      userMessage
    );
  }
  
  static external(service, message, userMessage = "External service unavailable") {
    return new AppError(
      `${service}: ${message}`,
      503,
      "external_service",
      userMessage
    );
  }
  
  static fileUpload(message, userMessage = "File upload failed") {
    return new AppError(
      message,
      400,
      "file_upload",
      userMessage
    );
  }
  
  static rateLimited(message = "Rate limit exceeded") {
    return new AppError(
      message,
      429,
      "rate_limit",
      "Too many requests. Please try again later"
    );
  }
}