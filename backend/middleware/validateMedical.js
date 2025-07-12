import { z } from 'zod/v4';

export function validateMedical(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message =
        result.error?.errors && result.error.errors.length > 0
          ? result.error.errors[0].message
          : 'Invalid request data';
      return res.status(400).json({
        success: false,
        message,
      });
    }
    req.validatedBody = result.data;
    next();
  };
} 