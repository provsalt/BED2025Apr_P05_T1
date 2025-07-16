export function validateCommunity(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error?.errors?.map(e => e.message) || ['Validation failed'];
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    req.validatedBody = result.data;
    next();
  };
} 