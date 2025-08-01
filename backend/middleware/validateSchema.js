import { ErrorFactory } from "../utils/AppError.js";

export function validateSchema(schema) {
  return async (req, res, next) => {
    // throws a ZodError if validation fails. this will be caught by the global error handler
    try {
      await schema.parseAsync(req.body);

      next();
    } catch (error) {
      throw ErrorFactory.validation("Invalid body data", error)
    }
  };
}

export function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.query);

      next();
    } catch (error) {
      throw ErrorFactory.validation("invalid query parameters", error)
    }
  };
}

export function validateParams(schema) {
  return async (req, res, next) => {
    try {
      await schema.parse(req.query);

      next();
    } catch (error) {
      throw ErrorFactory.validation("invalid path parameters", error)
    }
  };
} 
