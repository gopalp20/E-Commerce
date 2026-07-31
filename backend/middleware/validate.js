const AppError = require("../utils/AppError");

const validate = (schema, target = "body") => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    return next(
      new AppError(
        "Validation failed",
        400,
        result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      )
    );
  }

  // Express 5 exposes req.query through a getter, so retain normalized query
  // values separately instead of relying on assignment to req.query.
  req.validated = { ...(req.validated || {}), [target]: result.data };
  if (target !== "query") req[target] = result.data;
  next();
};

module.exports = validate;
