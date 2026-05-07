// Factory that returns a middleware to validate req.body against a Zod schema.
// Usage: router.post('/products', validate(createProductSchema), handler)

export const validate = (schema) => (req, res, next) => {
      // parse() throws ZodError on failure — caught by errorHandler
    req.body = schema.parse(req.body);
    next();
}

// Validate query params (for filtering, pagination)
export const validateQuery = (schema) => (req, res, next) => {
    req.query = schema.parse(req.query);
    next();
}