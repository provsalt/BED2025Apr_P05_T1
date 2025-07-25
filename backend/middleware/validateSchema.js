import { ErrorFactory } from "../utils/AppError.js";

export function validateSchema(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues?.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      
      return next(ErrorFactory.validation(
        "Request body validation failed",
        details
      ));
    }
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.issues?.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      
      return next(ErrorFactory.validation(
        "Query parameters validation failed",
        details
      ));
    }

    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const details = result.error.issues?.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      
      return next(ErrorFactory.validation(
        "Path parameters validation failed",
        details
      ));
    }

    next();
  };
} 
