import { ErrorFactory } from "../utils/AppError.js";
import { logInfo} from "../utils/logger.js";

export function validateSchema(schema) {
  return (req, res, next) => {
    const result = schema.parse(req.body);
    if (!result.success) {
      // this should never run because parse will throw an error if validation fails
      const details = result.error.issues?.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      return next(ErrorFactory.validation(
        "Request body validation failed",
        result.error
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
