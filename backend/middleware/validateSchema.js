export function validateSchema(schema) {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.body);
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
      
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
      });
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message =
        result.error?.errors && result.error.errors.length > 0
          ? result.error.errors[0].message
          : 'Invalid query parameters';
      return res.status(400).json({
        success: false,
        message,
      });
    }
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const message =
        result.error?.errors && result.error.errors.length > 0
          ? result.error.errors[0].message
          : 'Invalid path parameters';
      return res.status(400).json({
        success: false,
        message,
      });
    }
    next();
  };
} 
