import { AppError } from "../utils/AppError.js";
import { logError } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logError(err, req);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.userMessage,
      ...(process.env.NODE_ENV === "development" && {
        details: err.details,
        stack: err.stack
      }),
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.details || err.message,
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "Invalid input data",
      details: err.issues?.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      })) || err.message,
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid authentication token",
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Authentication token has expired",
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File size too large",
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: "Unexpected file field",
      ...(req.traceId && { traceId: req.traceId })
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      message: err.message,
      stack: err.stack
    }),
    ...(req.traceId && { traceId: req.traceId })
  });
};