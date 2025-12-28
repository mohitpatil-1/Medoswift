import createError from "http-errors";

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(createError(400, result.error.issues.map(i => i.message).join(", ")));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(createError(400, result.error.issues.map(i => i.message).join(", ")));
    }
    req.query = result.data;
    next();
  };
}
